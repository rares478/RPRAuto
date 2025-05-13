using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Listing;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Enums;
using MongoDB.Driver;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("listing")]
public class ListingController : ControllerBase
{
    private readonly IListingRepository _listingRepository;
    private readonly IUserRepository _userRepository;

    public ListingController(IListingRepository listingRepository, IUserRepository userRepository)
    {
        _listingRepository = listingRepository;
        _userRepository = userRepository;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetListingById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid listing ID format");

        var listing = await _listingRepository.GetByIdAsync(objectId);
        if (listing == null)
            throw new NotFoundException("Listing not found");

        return Ok(listing);
    }

    [HttpPost]
    public async Task<IActionResult> CreateListing([FromBody] ListingCreateRequest request)
    {
        var userId = GetUserIdFromToken();
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        var listing = new Listing
        {
            UserId = userId,
            Title = $"{request.Car.Make} {request.Car.Model} {request.Car.Year}",
            Car = request.Car,
            Price = request.Price,
            Description = request.Description,
            Status = ListingStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _listingRepository.CreateAsync(listing);

        user.Listings.Add(listing.Id);
        await _userRepository.UpdateAsync(userId, user);

        return Ok(new { message = "Listing created successfully", listingId = listing.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateListing(string id, [FromBody] ListingUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid listing ID format");

        var listing = await _listingRepository.GetByIdAsync(objectId);
        if (listing == null)
            throw new NotFoundException("Listing not found");

        var userId = GetUserIdFromToken();
        if (listing.UserId != userId)
            throw new UnauthorizedException("You are not authorized to update this listing");

        listing.Price = request.Price;
        listing.Description = request.Description;

        await _listingRepository.UpdateAsync(objectId, listing);
        return Ok(new { message = "Listing updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteListing(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid listing ID format");

        var listing = await _listingRepository.GetByIdAsync(objectId);
        if (listing == null)
            throw new NotFoundException("Listing not found");

        var userId = GetUserIdFromToken();
        if (listing.UserId != userId)
            throw new UnauthorizedException("You are not authorized to delete this listing");

        await _listingRepository.DeleteAsync(objectId);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.Listings.Remove(objectId);
            await _userRepository.UpdateAsync(userId, user);
        }

        return Ok(new { message = "Listing deleted successfully" });
    }

    [HttpPost("{id}/purchase")]
    public async Task<IActionResult> PurchaseListing(string id, [FromBody] ListingPurchaseRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid listing ID format");

        var listing = await _listingRepository.GetByIdAsync(objectId);
        if (listing == null)
            throw new NotFoundException("Listing not found");

        if (listing.Status != ListingStatus.Active)
            throw new ValidationException("This listing is not available for purchase");

        listing.Status = ListingStatus.Sold;
        await _listingRepository.UpdateAsync(objectId, listing);

        return Ok(new { message = "Listing purchased successfully" });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserListings(string userId)
    {
        if (!ObjectId.TryParse(userId, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var listings = await _listingRepository.GetByUserIdAsync(objectId);
        return Ok(listings);
    }

    [HttpGet]
    public async Task<IActionResult> GetListingsByPage(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        if (page < 1)
            throw new ValidationException("Page number must be greater than 0");
        
        if (pageSize < 1)
            throw new ValidationException("Page size must be greater than 0");

        var (listings, totalCount) = await _listingRepository.GetListingsByPageAsync(page, pageSize);
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return Ok(new
        {
            Listings = listings,
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

    [HttpGet("search")]
    public async Task<IActionResult> SearchListings(
        [FromQuery] string? make = null,
        [FromQuery] string? model = null,
        [FromQuery] decimal? price = null,
        [FromQuery] int? year = null,
        [FromQuery] string? gearbox = null,
        [FromQuery] string? body = null,
        [FromQuery] string? color = null,
        [FromQuery] int? doors = null,
        [FromQuery] string? fuel = null,
        [FromQuery] float? engine = null,
        [FromQuery] int? power = null,
        [FromQuery] int? mileage = null)
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.Status, ListingStatus.Active);

        if (!string.IsNullOrEmpty(make))
            filter &= Builders<Listing>.Filter.Regex(l => l.Car.Make, new MongoDB.Bson.BsonRegularExpression(make, "i"));

        if (!string.IsNullOrEmpty(model))
            filter &= Builders<Listing>.Filter.Regex(l => l.Car.Model, new MongoDB.Bson.BsonRegularExpression(model, "i"));

        if (price.HasValue)
            filter &= Builders<Listing>.Filter.Eq(l => l.Price, price.Value);

        if (year.HasValue)
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.Year, year.Value);

        if (!string.IsNullOrEmpty(gearbox) && gearbox != "Any")
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.GearboxType.ToString(), gearbox);

        if (!string.IsNullOrEmpty(body) && body != "Any")
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.BodyType.ToString(), body);

        if (!string.IsNullOrEmpty(color))
            filter &= Builders<Listing>.Filter.Regex(l => l.Car.Color, new MongoDB.Bson.BsonRegularExpression(color, "i"));

        if (doors.HasValue)
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.Doors, doors.Value);

        if (!string.IsNullOrEmpty(fuel))
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.FuelType.ToString(), fuel);

        if (engine.HasValue)
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.EngineSize, engine.Value);

        if (power.HasValue)
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.HorsePower, power.Value);

        if (mileage.HasValue)
            filter &= Builders<Listing>.Filter.Eq(l => l.Car.Mileage, mileage.Value);

        var listings = await _listingRepository.SearchAsync(filter);
        return Ok(listings);
    }

    private ObjectId GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedException("Invalid user token");

        return userId;
    }
}