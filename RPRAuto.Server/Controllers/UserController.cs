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

        var userId = GetUserIdFromToken();
        var isOwner = user.UserId == userId;

        // If the requesting user is the owner, return full data
        if (isOwner)
        {
            return Ok(new UserResponse
            {
                UserId = user.UserId.ToString(),
                Email = user.PrivateData.Login.Email,
                Role = user.Role,
                CompanyCUI = user.CompanyCUI,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                PublicData = user.PublicData,
                Listings = user.Listings.Select(l => l.ToString()).ToList(),
                Bids = user.Bids.Select(b => b.ToString()).ToList(),
                ReviewId = user.Review?.ToString()
            });
        }

        // For other users, return only public data
        return Ok(new UserResponse
        {
            UserId = user.UserId.ToString(),
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
        if (user.UserId != userId)
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

        // Update password if provided
        if (!string.IsNullOrEmpty(request.CurrentPassword) && !string.IsNullOrEmpty(request.NewPassword))
        {
            if (!user.VerifyPassword(request.CurrentPassword))
                throw new ValidationException("Current password is incorrect");

            user.PrivateData.Login.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

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
        if (user.UserId != userId)
        {
            _logger.LogWarning($"Unauthorized access attempt. Token ID: {userId}, User ID: {user.UserId}");
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