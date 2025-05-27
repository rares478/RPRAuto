using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Enums;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("bid")]
public class BidController : ControllerBase
{
    private readonly IBidRepository _bidRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<BidController> _logger;

    public BidController(
        IBidRepository bidRepository,
        IUserRepository userRepository,
        ILogger<BidController> logger)
    {
        _bidRepository = bidRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetBids(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        if (page < 1)
            throw new ValidationException("Page number must be greater than 0");
        
        if (pageSize < 1)
            throw new ValidationException("Page size must be greater than 0");

        var (bids, totalCount) = await _bidRepository.GetBidsByPageAsync(page, pageSize);
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return Ok(new
        {
            Bids = bids,
            Pagination = new
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateBid([FromBody] BidCreateRequest request)
    {
        var userId = GetUserIdFromToken();
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        var bid = new Bid
        {
            UserId = userId,
            Title = request.Title,
            TopBid = 0,
            MinBid = request.MinBid,
            InstantBuy = request.InstantBuy,
            Car = new RPRAuto.Server.Models.Car.Car
            {
                Make = request.Car.Make,
                Model = request.Car.Model,
                Year = request.Car.Year,
                Mileage = request.Car.Mileage,
                Color = request.Car.Color,
                GearboxType = request.Car.GearboxType,
                FuelType = request.Car.FuelType,
                BodyType = request.Car.BodyType,
                EngineSize = request.Car.EngineSize,
                HorsePower = request.Car.HorsePower,
                Pictures = request.Car.Pictures,
                Doors = request.Car.Doors,
                Description = request.Car.Description
            },
            CreatedAt = DateTime.UtcNow,
            EndAt = request.EndAt,
            Bids = new Dictionary<ObjectId, decimal>()
        };

        await _bidRepository.CreateAsync(bid);
        return Ok(new { message = "Bid created successfully", bidId = bid.Id });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBidById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid bid ID format");

        var bid = await _bidRepository.GetByIdAsync(objectId);
        if (bid == null)
            throw new NotFoundException("Bid not found");

        return Ok(bid);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBid(string id, [FromBody] BidUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid bid ID format");

        var bid = await _bidRepository.GetByIdAsync(objectId);
        if (bid == null)
            throw new NotFoundException("Bid not found");

        var userId = GetUserIdFromToken();
        if (bid.UserId != userId)
            throw new UnauthorizedException("You are not authorized to update this bid");

        if (DateTime.UtcNow >= bid.EndAt)
            throw new ValidationException("Cannot update expired bid");

        bid.Title = request.Title;
        bid.MinBid = request.MinBid;
        bid.InstantBuy = request.InstantBuy;

        await _bidRepository.UpdateAsync(objectId, bid);
        return Ok(new { message = "Bid updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBid(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid bid ID format");

        var bid = await _bidRepository.GetByIdAsync(objectId);
        if (bid == null)
            throw new NotFoundException("Bid not found");

        var userId = GetUserIdFromToken();
        if (bid.UserId != userId)
            throw new UnauthorizedException("You are not authorized to delete this bid");

        if (bid.Bids.Count > 0)
            throw new ValidationException("Cannot delete bid with existing bids");

        await _bidRepository.DeleteAsync(objectId);
        return Ok(new { message = "Bid deleted successfully" });
    }

    [HttpPost("{id}/place")]
    public async Task<IActionResult> PlaceBid(string id, [FromBody] BidPlaceRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid bid ID format");

        var bid = await _bidRepository.GetByIdAsync(objectId);
        if (bid == null)
            throw new NotFoundException("Bid not found");

        if (DateTime.UtcNow >= bid.EndAt)
            throw new ValidationException("Bid has expired");

        var userId = GetUserIdFromToken();
        if (bid.UserId == userId)
            throw new ValidationException("Cannot place bid on your own bid");

        if (bid.Bids.ContainsKey(userId))
            throw new ValidationException("You have already placed a bid");

        if (request.Amount < bid.MinBid)
            throw new ValidationException($"Bid amount must be at least {bid.MinBid}");

        if (bid.TopBid > 0 && request.Amount <= bid.TopBid)
            throw new ValidationException($"Bid amount must be higher than current top bid of {bid.TopBid}");

        bid.Bids[userId] = request.Amount;
        bid.TopBid = request.Amount;

        if (bid.InstantBuy > 0 && request.Amount >= bid.InstantBuy)
        {
            bid.EndAt = DateTime.UtcNow;
        }

        await _bidRepository.UpdateAsync(objectId, bid);
        return Ok(new { message = "Bid placed successfully" });
    }

    private ObjectId GetUserIdFromToken()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        _logger.LogInformation("=== Token Debug Info ===");
        _logger.LogInformation("Raw Authorization header: {AuthHeader}", authHeader);
        
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        _logger.LogInformation("UserIdClaim: {UserIdClaim}", userIdClaim?.Value ?? "null");
        _logger.LogInformation("All Claims: {Claims}", string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}")));
        
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
        {
            _logger.LogError("Token validation failed:");
            _logger.LogError("- UserIdClaim is null: {IsNull}", userIdClaim == null);
            if (userIdClaim != null)
            {
                _logger.LogError("- UserIdClaim value: {Value}", userIdClaim.Value);
                _logger.LogError("- Could parse as ObjectId: {CanParse}", ObjectId.TryParse(userIdClaim.Value, out _));
            }
            throw new UnauthorizedException("Invalid user token");
        }

        _logger.LogInformation("Successfully parsed userId: {UserId}", userId);
        _logger.LogInformation("=====================");
        return userId;
    }
}