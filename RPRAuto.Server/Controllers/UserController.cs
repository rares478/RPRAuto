using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.User;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Review;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using RPRAuto.Server.Models.Enums;
using RPRAuto.Server.Models.Listing;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IListingRepository _listingRepository;
    private readonly IBidRepository _bidRepository;
    private readonly IReviewRepository _reviewRepository;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserRepository userRepository,
        IListingRepository listingRepository,
        IBidRepository bidRepository,
        IReviewRepository reviewRepository,
        ILogger<UserController> logger)
    {
        _userRepository = userRepository;
        _listingRepository = listingRepository;
        _bidRepository = bidRepository;
        _reviewRepository = reviewRepository;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        var userId = GetUserIdFromToken();
        var isOwner = user.Id == userId;

        // If the requesting user is the owner, return full data
        if (isOwner)
        {
            return Ok(new UserResponse
            {
                Id = user.Id.ToString(),
                Email = user.PrivateData.Login.Email,
                Role = user.Role,
                CompanyCUI = user.CompanyCUI,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                PrivateData = user.PrivateData,
                PublicData = user.PublicData,
                Listings = user.Listings.Select(l => l.ToString()).ToList(),
                Bids = user.Bids.Select(b => b.ToString()).ToList(),
                ReviewId = user.Review?.ToString()
            });
        }

        // For other users, return only public data
        return Ok(new UserResponse
        {
            Id = user.Id.ToString(),
            Role = user.Role,
            PublicData = user.PublicData,
            Listings = user.Listings.Select(l => l.ToString()).ToList(),
            ReviewId = user.Review?.ToString()
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ModifyUser(string id, [FromBody] UserUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        var userId = GetUserIdFromToken();
        if (user.Id != userId)
            throw new UnauthorizedException("You are not authorized to modify this user");

        // Update personal data
        user.PrivateData.Personal.FirstName = request.FirstName;
        user.PrivateData.Personal.LastName = request.LastName;
        user.PrivateData.Personal.Address = request.Address;

        // Update public data
        user.PublicData.DisplayName = request.DisplayName;
        user.PublicData.Avatar = request.Avatar;
        user.PublicData.PhoneNumber = request.PhoneNumber;
        user.PublicData.City = request.City;
        user.PublicData.Country = request.Country;

        // Update company data
        user.CompanyCUI = request.CompanyCUI;

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(objectId, user);
        return Ok(new { message = "User updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        var userId = GetUserIdFromToken();
        if (user.Id != userId)
            throw new UnauthorizedException("You are not authorized to delete this user");

        await _userRepository.DeleteAsync(objectId);
        return Ok(new { message = "User deleted successfully" });
    }

    [HttpGet("{id}/listings")]
    public async Task<IActionResult> GetAllListings(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var listings = await _listingRepository.GetByUserIdAsync(objectId);
        return Ok(listings);
    }

    [HttpGet("{id}/bids")]
    public async Task<IActionResult> GetUserBids(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest("Invalid user ID format");

        try
        {
            var bids = await _bidRepository.GetByUserIdAsync(objectId);
            return Ok(bids);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user bids for user {UserId}", id);
            return StatusCode(500, "An error occurred while retrieving user bids");
        }
    }

    [HttpGet("{id}/login")]
    public async Task<IActionResult> GetLoginDetails(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        var userId = GetUserIdFromToken();
        if (user.Id != userId)
            throw new UnauthorizedException("You are not authorized to view this user's login details");

        return Ok(new LoginDetailsResponse
        {
            Email = user.PrivateData.Login.Email,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        });
    }

    [HttpGet("{id}/personal")]
    public async Task<IActionResult> GetPersonalDetails(string id)
    {
        _logger.LogInformation($"GetPersonalDetails called with id: {id}");
        
        if (!ObjectId.TryParse(id, out var objectId))
        {
            _logger.LogWarning($"Invalid user ID format: {id}");
            throw new ValidationException("Invalid user ID format");
        }

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
        {
            _logger.LogWarning($"User not found with ID: {objectId}");
            throw new NotFoundException("User not found");
        }

        var userId = GetUserIdFromToken();
        if (user.Id != userId)
        {
            _logger.LogWarning($"Unauthorized access attempt. Token ID: {userId}, User ID: {user.Id}");
            throw new UnauthorizedException("You are not authorized to view this user's personal details");
        }

        return Ok(new PersonalDetailsResponse
        {
            FirstName = user.PrivateData.Personal.FirstName,
            LastName = user.PrivateData.Personal.LastName,
            Address = user.PrivateData.Personal.Address,
            Email = user.PrivateData.Login.Email,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPost("review")]
    public async Task<IActionResult> CreateReview([FromBody] ReviewCreateRequest request)
    {
        var userId = GetUserIdFromToken();
        
        // Validate the transaction exists and user was involved
        var listing = await _listingRepository.GetByIdAsync(ObjectId.Parse(request.TransactionId));
        if (listing == null)
            throw new NotFoundException("Transaction not found");

        if (listing.UserId != ObjectId.Parse(request.SellerId))
            throw new ValidationException("Invalid seller ID for this transaction");

        if (listing.SoldTo != userId)
            throw new ValidationException("You can only review transactions you were involved in");

        // Check if user already reviewed this transaction
        var existingReview = await _reviewRepository.GetByTransactionAndUserAsync(
            ObjectId.Parse(request.TransactionId),
            userId);
        
        if (existingReview != null)
            throw new ValidationException("You have already reviewed this transaction");

        var review = new Review
        {
            UserId = userId,
            SellerId = ObjectId.Parse(request.SellerId),
            TransactionId = ObjectId.Parse(request.TransactionId),
            TransactionType = request.TransactionType,
            rating = request.Rating,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.CreateAsync(review);

        // Update seller's average rating
        var sellerReviews = await _reviewRepository.GetBySellerAsync(ObjectId.Parse(request.SellerId));
        var seller = await _userRepository.GetByIdAsync(ObjectId.Parse(request.SellerId));
        if (seller != null)
        {
            seller.Rating = sellerReviews.Average(r => r.rating);
            await _userRepository.UpdateAsync(seller.Id, seller);
        }

        return Ok(new { message = "Review created successfully" });
    }

    [HttpGet("{id}/reviews")]
    public async Task<IActionResult> GetUserReviews(string id)
    {
        if (!ObjectId.TryParse(id, out var userId))
            throw new ValidationException("Invalid user ID format");

        var reviews = await _reviewRepository.GetBySellerAsync(userId);
        return Ok(reviews);
    }

    [HttpGet("{id}/public")]
    public async Task<IActionResult> GetPublicProfile(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        return Ok(user.PublicData);
    }

    [HttpGet("{userId}/purchases")]
    public async Task<IActionResult> GetUserPurchases(string userId)
    {
        if (!ObjectId.TryParse(userId, out var objectId))
            return BadRequest("Invalid user ID format");

        try
        {
            // Get the purchase IDs (direct purchases)
            var purchaseIds = await _userRepository.GetUserPurchasesAsync(objectId);
            
            // Get the full listing details for each purchase
            var directPurchases = new List<Listing>();
            foreach (var purchaseId in purchaseIds)
            {
                var listing = await _listingRepository.GetByIdAsync(purchaseId);
                if (listing != null)
                {
                    directPurchases.Add(listing);
                }
            }

            // Get auction wins (bids where user was the highest bidder)
            var userBids = await _bidRepository.GetByUserIdAsync(objectId);
            var auctionWins = userBids
                .Where(b => b.Status == BidStatus.Completed && 
                           b.Bids.ContainsKey(objectId.ToString()) && 
                           b.Bids[objectId.ToString()] == b.TopBid)
                .Select(b => b.Id)
                .Distinct()
                .ToList();

            var auctionPurchases = new List<Listing>();
            foreach (var bidId in auctionWins)
            {
                var bid = await _bidRepository.GetByIdAsync(bidId);
                if (bid != null)
                {
                    // Create a listing from the bid information
                    var listing = new Listing
                    {
                        Id = bid.Id,
                        Car = bid.Car,
                        Price = bid.TopBid,
                        Description = bid.Description,
                        Status = ListingStatus.Sold,
                        CreatedAt = bid.CreatedAt
                    };
                    auctionPurchases.Add(listing);
                }
            }

            return Ok(new
            {
                DirectPurchases = directPurchases,
                AuctionWins = auctionPurchases
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user purchases for user {UserId}", userId);
            return StatusCode(500, "An error occurred while retrieving user purchases");
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