using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Exceptions;
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
    public async Task<IActionResult> CreateBid([FromBody] BidCreateRequestWrapper wrapper)
    {
        _logger.LogInformation("=== CreateBid Request Debug ===");
        _logger.LogInformation("Raw request data: {@Request}", wrapper.Request);
        _logger.LogInformation("Title: {Title}", wrapper.Request.Title);
        _logger.LogInformation("MinBid: {MinBid}", wrapper.Request.MinBid);
        _logger.LogInformation("InstantBuy: {InstantBuy}", wrapper.Request.InstantBuy);
        _logger.LogInformation("EndAt: {EndAt}", wrapper.Request.EndAt);
        _logger.LogInformation("Car Make: {Make}", wrapper.Request.Car.Make);
        _logger.LogInformation("Car Model: {Model}", wrapper.Request.Car.Model);
        _logger.LogInformation("Car Year: {Year}", wrapper.Request.Car.Year);
        _logger.LogInformation("Car Mileage: {Mileage}", wrapper.Request.Car.Mileage);
        _logger.LogInformation("Car Color: {Color}", wrapper.Request.Car.Color);
        _logger.LogInformation("Car GearboxType: {GearboxType}", wrapper.Request.Car.GearboxType);
        _logger.LogInformation("Car FuelType: {FuelType}", wrapper.Request.Car.FuelType);
        _logger.LogInformation("Car BodyType: {BodyType}", wrapper.Request.Car.BodyType);
        _logger.LogInformation("Car EngineSize: {EngineSize}", wrapper.Request.Car.EngineSize);
        _logger.LogInformation("Car HorsePower: {HorsePower}", wrapper.Request.Car.HorsePower);
        _logger.LogInformation("Car Doors: {Doors}", wrapper.Request.Car.Doors);
        _logger.LogInformation("Car Description: {Description}", wrapper.Request.Car.Description);
        
        try 
        {
            var userId = GetUserIdFromToken();
            _logger.LogInformation("UserId from token: {UserId}", userId);
            
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogError("User not found for ID: {UserId}", userId);
                throw new NotFoundException("User not found");
            }
            _logger.LogInformation("User found: {UserId}", userId);

            _logger.LogInformation("Car data from request: {@Car}", wrapper.Request.Car);
            var bid = new Bid
            {
                UserId = userId,
                Title = wrapper.Request.Title ?? $"{wrapper.Request.Car.Make} {wrapper.Request.Car.Model} {wrapper.Request.Car.Year}",
                TopBid = 0,
                MinBid = wrapper.Request.MinBid,
                InstantBuy = wrapper.Request.InstantBuy,
                Car = new RPRAuto.Server.Models.Car.Car
                {
                    Make = wrapper.Request.Car.Make,
                    Model = wrapper.Request.Car.Model,
                    Year = wrapper.Request.Car.Year,
                    Mileage = wrapper.Request.Car.Mileage,
                    Color = wrapper.Request.Car.Color,
                    GearboxType = wrapper.Request.Car.GearboxType,
                    FuelType = wrapper.Request.Car.FuelType,
                    BodyType = wrapper.Request.Car.BodyType,
                    EngineSize = wrapper.Request.Car.EngineSize,
                    HorsePower = wrapper.Request.Car.HorsePower,
                    Pictures = wrapper.Request.Car.Pictures,
                    Doors = wrapper.Request.Car.Doors,
                    Description = wrapper.Request.Car.Description
                },
                CreatedAt = DateTime.UtcNow,
                EndAt = wrapper.Request.EndAt,
                Bids = new Dictionary<string, decimal>()
            };
            _logger.LogInformation("Created bid object: {@Bid}", bid);

            await _bidRepository.CreateAsync(bid);
            _logger.LogInformation("Bid saved to database with ID: {BidId}", bid.Id);

            user.Bids.Add(bid.Id);
            await _userRepository.UpdateAsync(userId, user);
            _logger.LogInformation("User's bids updated");

            _logger.LogInformation("=== CreateBid Request Complete ===");
            return Ok(new { message = "Bid created successfully", bidId = bid.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bid: {Message}", ex.Message);
            _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
            throw;
        }
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

        if (bid.Bids.ContainsKey(userId.ToString()))
            throw new ValidationException("You have already placed a bid");

        if (request.Amount < bid.MinBid)
            throw new ValidationException($"Bid amount must be at least {bid.MinBid}");

        if (bid.TopBid > 0 && request.Amount <= bid.TopBid)
            throw new ValidationException($"Bid amount must be higher than current top bid of {bid.TopBid}");

        bid.Bids[userId.ToString()] = request.Amount;
        bid.TopBid = request.Amount;

        if (bid.InstantBuy > 0 && request.Amount >= bid.InstantBuy)
        {
            bid.EndAt = DateTime.UtcNow;
        }

        await _bidRepository.UpdateAsync(objectId, bid);
        return Ok(new { message = "Bid placed successfully" });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchBids(
        [FromQuery] string? make = null,
        [FromQuery] string? model = null,
        [FromQuery] decimal? priceMin = null,
        [FromQuery] decimal? priceMax = null,
        [FromQuery] int? yearFrom = null,
        [FromQuery] int? yearTo = null,
        [FromQuery] string? gearbox = null,
        [FromQuery] string? color = null,
        [FromQuery] int? doors = null,
        [FromQuery] string? fuel = null,
        [FromQuery] float? engineMin = null,
        [FromQuery] float? engineMax = null,
        [FromQuery] int? powerMin = null,
        [FromQuery] int? powerMax = null,
        [FromQuery] int? mileageMin = null,
        [FromQuery] int? mileageMax = null,
        [FromQuery] string? endingIn = null)
    {
        var filter = new BsonDocument
        {
            { "status", 0 } // Only active bids
        };

        if (!string.IsNullOrEmpty(make))
            filter.Add("car.make", new BsonRegularExpression(make, "i"));
        if (!string.IsNullOrEmpty(model))
            filter.Add("car.model", new BsonRegularExpression(model, "i"));
        if (priceMin.HasValue || priceMax.HasValue)
        {
            var priceRange = new BsonDocument();
            if (priceMin.HasValue) priceRange.Add("$gte", priceMin.Value);
            if (priceMax.HasValue) priceRange.Add("$lte", priceMax.Value);
            filter.Add("minBid", priceRange);
        }
        if (yearFrom.HasValue || yearTo.HasValue)
        {
            var yearRange = new BsonDocument();
            if (yearFrom.HasValue) yearRange.Add("$gte", yearFrom.Value);
            if (yearTo.HasValue) yearRange.Add("$lte", yearTo.Value);
            filter.Add("car.year", yearRange);
        }
        if (!string.IsNullOrEmpty(gearbox))
            filter.Add("car.gearboxType", gearbox);
        if (!string.IsNullOrEmpty(color))
            filter.Add("car.color", new BsonRegularExpression(color, "i"));
        if (doors.HasValue)
            filter.Add("car.doors", doors.Value);
        if (!string.IsNullOrEmpty(fuel))
            filter.Add("car.fuelType", fuel);
        if (engineMin.HasValue || engineMax.HasValue)
        {
            var engineRange = new BsonDocument();
            if (engineMin.HasValue) engineRange.Add("$gte", engineMin.Value);
            if (engineMax.HasValue) engineRange.Add("$lte", engineMax.Value);
            filter.Add("car.engineSize", engineRange);
        }
        if (powerMin.HasValue || powerMax.HasValue)
        {
            var powerRange = new BsonDocument();
            if (powerMin.HasValue) powerRange.Add("$gte", powerMin.Value);
            if (powerMax.HasValue) powerRange.Add("$lte", powerMax.Value);
            filter.Add("car.horsePower", powerRange);
        }
        if (mileageMin.HasValue || mileageMax.HasValue)
        {
            var mileageRange = new BsonDocument();
            if (mileageMin.HasValue) mileageRange.Add("$gte", mileageMin.Value);
            if (mileageMax.HasValue) mileageRange.Add("$lte", mileageMax.Value);
            filter.Add("car.mileage", mileageRange);
        }

        // Add endingIn filter
        if (!string.IsNullOrEmpty(endingIn))
        {
            DateTime now = DateTime.UtcNow;
            DateTime endTime = now;
            switch (endingIn)
            {
                case "1h":
                    endTime = now.AddHours(1);
                    break;
                case "12h":
                    endTime = now.AddHours(12);
                    break;
                case "1d":
                    endTime = now.AddDays(1);
                    break;
                case "3d":
                    endTime = now.AddDays(3);
                    break;
                case "1w":
                    endTime = now.AddDays(7);
                    break;
                default:
                    endTime = now;
                    break;
            }
            var endAtRange = new BsonDocument {
                { "$gte", now },
                { "$lte", endTime }
            };
            filter.Add("endAt", endAtRange);
        }

        var bids = await _bidRepository.SearchAsync(filter);
        return Ok(bids);
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