using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.User;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Review;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IListingRepository _listingRepository;
    private readonly IBidRepository _bidRepository;
    private readonly IReviewRepository _reviewRepository;

    public UserController(
        IUserRepository userRepository,
        IListingRepository listingRepository,
        IBidRepository bidRepository,
        IReviewRepository reviewRepository)
    {
        _userRepository = userRepository;
        _listingRepository = listingRepository;
        _bidRepository = bidRepository;
        _reviewRepository = reviewRepository;
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
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid user ID format");

        var user = await _userRepository.GetByIdAsync(objectId);
        if (user == null)
            throw new NotFoundException("User not found");

        var userId = GetUserIdFromToken();
        if (user.UserId != userId)
            throw new UnauthorizedException("You are not authorized to view this user's personal details");

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
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedException("Invalid user token");

        return userId;
    }
}