using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Listing;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Enums;
using MongoDB.Driver;

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

    [HttpGet]
    public async Task<IActionResult> GetAllListings()
    {
        var listings = await _listingRepository.GetActiveListingsAsync();
        return Ok(listings);
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
            Car = request.Car,
            Price = request.Price,
            Description = request.Description,
            Status = ListingStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _listingRepository.CreateAsync(listing);

        // Add listing to user's listings
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

        // Verify ownership
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

        // Verify ownership
        var userId = GetUserIdFromToken();
        if (listing.UserId != userId)
            throw new UnauthorizedException("You are not authorized to delete this listing");

        await _listingRepository.DeleteAsync(objectId);

        // Remove listing from user's listings
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

        // Update listing status to sold
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

    [HttpGet("search")]
    public async Task<IActionResult> SearchListings(
        [FromQuery] string? make = null,
        [FromQuery] string? model = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? minYear = null,
        [FromQuery] int? maxYear = null)
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.Status, ListingStatus.Active);

        if (make != null)
            filter &= Builders<Listing>.Filter.Regex(l => l.Car.Make, new MongoDB.Bson.BsonRegularExpression(make, "i"));

        if (model != null)
            filter &= Builders<Listing>.Filter.Regex(l => l.Car.Model, new MongoDB.Bson.BsonRegularExpression(model, "i"));

        if (minPrice.HasValue)
            filter &= Builders<Listing>.Filter.Gte(l => l.Price, minPrice.Value);

        if (maxPrice.HasValue)
            filter &= Builders<Listing>.Filter.Lte(l => l.Price, maxPrice.Value);

        if (minYear.HasValue)
            filter &= Builders<Listing>.Filter.Gte(l => l.Car.Year, minYear.Value);

        if (maxYear.HasValue)
            filter &= Builders<Listing>.Filter.Lte(l => l.Car.Year, maxYear.Value);

        var listings = await _listingRepository.SearchAsync(filter);
        return Ok(listings);
    }

    private ObjectId GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst("userId");
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedException("Invalid user token");

        return userId;
    }
}