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

        return Ok(user);
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
        if (user.UserId != userId)
            throw new UnauthorizedException("You are not authorized to modify this user");

        user.Personal.FirstName = request.FirstName;
        user.Personal.LastName = request.LastName;
        user.Personal.PhoneNumber = request.PhoneNumber;
        user.Personal.Address = request.Address;
        user.CompanyCUI = request.CompanyCUI;
        user.Personal.City = request.City;
        user.Personal.Country = request.Country;

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
        if (user.UserId != userId)
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
    public async Task<IActionResult> GetAllBids(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var bids = await _bidRepository.GetByUserIdAsync(objectId);
        return Ok(bids);
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
        if (user.UserId != userId)
            throw new UnauthorizedException("You are not authorized to view this user's login details");

        return Ok(new { email = user.Login.Email, role = user.Role });
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

        _logger.LogInformation($"Parsed ObjectId: {objectId}");
        
        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
        {
            _logger.LogWarning($"User not found with ID: {objectId}");
            throw new NotFoundException("User not found");
        }

        _logger.LogInformation($"Found user with ID: {user.UserId}");
        
        var userId = GetUserIdFromToken();
        _logger.LogInformation($"User ID from token: {userId}");
        _logger.LogInformation($"Comparing token ID: {userId} with user ID: {user.UserId}");
        
        if (userId.ToString() != user.UserId.ToString())
        {
            _logger.LogWarning($"Unauthorized access attempt. Token ID: {userId}, User ID: {user.UserId}");
            throw new UnauthorizedException("You are not authorized to view this user's personal details");
        }

        _logger.LogInformation("Successfully authorized access to personal details");
        
        return Ok(new
        {
            firstName = user.Personal.FirstName,
            lastName = user.Personal.LastName,
            phoneNumber = user.Personal.PhoneNumber,
            address = user.Personal.Address,
            createdAt = user.CreatedAt
        });
    }

    [HttpPut("{id}/review")]
    public async Task<IActionResult> AddReview(string id, [FromBody] ReviewRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        var review = new Review
        {
            ReviewerId = objectId,
            Rating = request.Rating,
            ReviewText = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.CreateAsync(review);
        return Ok(new { message = "Review added successfully", reviewId = review.ReviewId });
    }

    [HttpGet("{id}/review")]
    public async Task<IActionResult> GetReview(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var review = await _userRepository.GetUserReviewAsync(objectId);
        return Ok(review);
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