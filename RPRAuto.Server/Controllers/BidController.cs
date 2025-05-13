using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("bid")]
public class BidController : ControllerBase
{
    private readonly IBidRepository _bidRepository;
    private readonly IUserRepository _userRepository;

    public BidController(
        IBidRepository bidRepository,
        IUserRepository userRepository)
    {
        _bidRepository = bidRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetBids()
    {
        var bids = await _bidRepository.GetLatestBidsAsync(30);
        return Ok(bids);
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
            TopBid = request.TopBid,
            MinBid = request.MinBid,
            InstantBuy = request.InstantBuy,
            Car = request.Car,
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

        // Check if user has already bid
        if (bid.Bids.ContainsKey(userId))
            throw new ValidationException("You have already placed a bid");

        // Check if bid amount meets minimum requirements
        if (request.Amount < bid.MinBid)
            throw new ValidationException($"Bid amount must be at least {bid.MinBid}");

        // Check if bid amount is higher than current top bid
        if (bid.TopBid > 0 && request.Amount <= bid.TopBid)
            throw new ValidationException($"Bid amount must be higher than current top bid of {bid.TopBid}");

        // Add the bid
        bid.Bids[userId] = request.Amount;
        bid.TopBid = request.Amount;

        // Check for instant buy
        if (bid.InstantBuy > 0 && request.Amount >= bid.InstantBuy)
        {
            // Handle instant buy logic
            bid.EndAt = DateTime.UtcNow;
        }

        await _bidRepository.UpdateAsync(objectId, bid);
        return Ok(new { message = "Bid placed successfully" });
    }

    private ObjectId GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst("userId");
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedException("Invalid user token");

        return userId;
    }
}