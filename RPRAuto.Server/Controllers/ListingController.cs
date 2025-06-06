﻿using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Listing;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Enums;
using MongoDB.Driver;
using System.Security.Claims;
using RPRAuto.Server.Models.Car;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("listing")]
public class ListingController : ControllerBase
{
    private readonly IListingRepository _listingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ListingController> _logger;

    public ListingController(
        IListingRepository listingRepository, 
        IUserRepository userRepository, 
        ILogger<ListingController> logger)
    {
        _listingRepository = listingRepository;
        _userRepository = userRepository;
        _logger = logger;
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
        _logger.LogInformation("=== CreateListing Request Debug ===");
        _logger.LogInformation("Raw request data: {@Request}", request);
        
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

            _logger.LogInformation("Car data from request: {@Car}", request.Car);
            var listing = new Listing
            {
                UserId = userId,
                Title = request.Title ?? $"{request.Car.Make} {request.Car.Model} {request.Car.Year}",
                Car = new Car
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
                    Pictures = request.Car.Pictures
                },
                Price = request.Price,
                Description = request.Description,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow
            };
            _logger.LogInformation("Created listing object: {@Listing}", listing);

            await _listingRepository.CreateAsync(listing);
            _logger.LogInformation("Listing saved to database with ID: {ListingId}", listing.Id);

            user.Listings.Add(listing.Id);
            await _userRepository.UpdateAsync(userId, user);
            _logger.LogInformation("User's listings updated");

            _logger.LogInformation("=== CreateListing Request Complete ===");
            return Ok(new { message = "Listing created successfully", listingId = listing.Id.ToString() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating listing: {Message}", ex.Message);
            _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
            throw;
        }
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

        if (!ObjectId.TryParse(request.UserId, out var buyerId))
            throw new ValidationException("Invalid buyer ID format");

        var listing = await _listingRepository.GetByIdAsync(objectId);
        if (listing == null)
            throw new NotFoundException("Listing not found");

        if (listing.Status != ListingStatus.Active)
            throw new ValidationException("This listing is not available for purchase");

        // Check if user is trying to buy their own listing
        if (listing.UserId == buyerId)
            throw new ValidationException("You cannot purchase your own listing");

        // Get the buyer's user data
        var buyer = await _userRepository.GetByIdAsync(buyerId);
        if (buyer == null)
            throw new NotFoundException("Buyer not found");

        // Update listing status
        listing.Status = ListingStatus.Sold;
        listing.SoldTo = buyerId;
        listing.SoldAt = DateTime.UtcNow;
        await _listingRepository.UpdateAsync(objectId, listing);

        // Update buyer's purchase history
        buyer.Purchases.Add(objectId);
        await _userRepository.UpdateAsync(buyerId, buyer);

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
        [FromQuery] decimal? priceMin = null,
        [FromQuery] decimal? priceMax = null,
        [FromQuery] int? year = null,
        [FromQuery] int? yearFrom = null,
        [FromQuery] int? yearTo = null,
        [FromQuery] string? gearbox = null,
        [FromQuery] string? body = null,
        [FromQuery] string? color = null,
        [FromQuery] int? doors = null,
        [FromQuery] string? fuel = null,
        [FromQuery] float? engine = null,
        [FromQuery] float? engineMin = null,
        [FromQuery] float? engineMax = null,
        [FromQuery] int? power = null,
        [FromQuery] int? powerMin = null,
        [FromQuery] int? powerMax = null,
        [FromQuery] int? mileage = null,
        [FromQuery] int? mileageMin = null,
        [FromQuery] int? mileageMax = null)
    {
        try
        {
            _logger.LogInformation("Starting search with parameters: make={Make}, model={Model}, price={Price}, priceMin={PriceMin}, priceMax={PriceMax}, year={Year}, yearFrom={YearFrom}, yearTo={YearTo}, mileage={Mileage}, mileageMin={MileageMin}, mileageMax={MileageMax}", 
                make, model, price, priceMin, priceMax, year, yearFrom, yearTo, mileage, mileageMin, mileageMax);

            // Build the filter using BsonDocument
            var filter = new BsonDocument
            {
                { "status", 0 }  // Active listings only
            };

            // Add make filter if provided
            if (!string.IsNullOrEmpty(make))
            {
                filter.Add("car.make", new BsonRegularExpression(make, "i"));
            }

            // Add model filter if provided
            if (!string.IsNullOrEmpty(model))
            {
                filter.Add("car.model", new BsonRegularExpression(model, "i"));
            }

            // Add price range filter if provided
            if (priceMin.HasValue || priceMax.HasValue)
            {
                var priceRange = new BsonDocument();
                if (priceMin.HasValue) priceRange.Add("$gte", priceMin.Value);
                if (priceMax.HasValue) priceRange.Add("$lte", priceMax.Value);
                filter.Add("price", priceRange);
            }
            else if (price.HasValue)
            {
                filter.Add("price", price.Value);
            }

            // Add year range filter if provided
            if (yearFrom.HasValue || yearTo.HasValue)
            {
                var yearRange = new BsonDocument();
                if (yearFrom.HasValue) yearRange.Add("$gte", yearFrom.Value);
                if (yearTo.HasValue) yearRange.Add("$lte", yearTo.Value);
                filter.Add("car.year", yearRange);
            }
            else if (year.HasValue)
            {
                filter.Add("car.year", year.Value);
            }

            // Add gearbox filter if provided
            if (!string.IsNullOrEmpty(gearbox) && gearbox != "Any")
            {
                filter.Add("car.gearboxType", gearbox);
            }

            // Add body type filter if provided
            if (!string.IsNullOrEmpty(body) && body != "Any")
            {
                filter.Add("car.bodyType", body);
            }

            // Add color filter if provided
            if (!string.IsNullOrEmpty(color))
            {
                filter.Add("car.color", new BsonRegularExpression(color, "i"));
            }

            // Add doors filter if provided
            if (doors.HasValue)
            {
                filter.Add("car.doors", doors.Value);
            }

            // Add fuel type filter if provided
            if (!string.IsNullOrEmpty(fuel))
            {
                filter.Add("car.fuelType", fuel);
            }

            // Add engine size range filter if provided
            if (engineMin.HasValue || engineMax.HasValue)
            {
                var engineRange = new BsonDocument();
                if (engineMin.HasValue) engineRange.Add("$gte", engineMin.Value);
                if (engineMax.HasValue) engineRange.Add("$lte", engineMax.Value);
                filter.Add("car.engineSize", engineRange);
            }
            else if (engine.HasValue)
            {
                filter.Add("car.engineSize", engine.Value);
            }

            // Add power range filter if provided
            if (powerMin.HasValue || powerMax.HasValue)
            {
                var powerRange = new BsonDocument();
                if (powerMin.HasValue) powerRange.Add("$gte", powerMin.Value);
                if (powerMax.HasValue) powerRange.Add("$lte", powerMax.Value);
                filter.Add("car.horsePower", powerRange);
            }
            else if (power.HasValue)
            {
                filter.Add("car.horsePower", power.Value);
            }

            // Add mileage range filter if provided
            if (mileageMin.HasValue || mileageMax.HasValue)
            {
                var mileageRange = new BsonDocument();
                if (mileageMin.HasValue) mileageRange.Add("$gte", mileageMin.Value);
                if (mileageMax.HasValue) mileageRange.Add("$lte", mileageMax.Value);
                filter.Add("car.mileage", mileageRange);
            }
            else if (mileage.HasValue)
            {
                filter.Add("car.mileage", mileage.Value);
            }

            try
            {
                _logger.LogInformation("Executing search with filter: {Filter}", filter.ToString());
                var listings = await _listingRepository.SearchAsync(filter);
                _logger.LogInformation("Search completed successfully. Found {Count} listings", listings.Count());
                return Ok(listings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing search query: {Message}\nStackTrace: {StackTrace}", ex.Message, ex.StackTrace);
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SearchListings: {Message}\nStackTrace: {StackTrace}", ex.Message, ex.StackTrace);
            return StatusCode(500, new 
            { 
                errorCode = "INTERNAL_SERVER_ERROR", 
                message = "An unexpected error occurred.", 
                details = ex.Message,
                stackTrace = ex.StackTrace,
                innerException = ex.InnerException?.Message
            });
        }
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