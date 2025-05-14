using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Review;
using RPRAuto.Server.Exceptions;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("review")]
public class ReviewController : ControllerBase
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IUserRepository _userRepository;

    public ReviewController(IReviewRepository reviewRepository, IUserRepository userRepository)
    {
        _reviewRepository = reviewRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews()
    {
        var reviews = await _reviewRepository.GetLatestReviewsAsync(30);
        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewRequest request)
    {
        var reviewerId = GetUserIdFromToken();

        var review = new Review
        {
            ReviewerId = reviewerId,
            Rating = request.Rating,
            ReviewText = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.CreateAsync(review);
        return Ok(new { message = "Review added successfully", reviewId = review.ReviewId });
    }

    [HttpPut("{id}/modify")]
    public async Task<IActionResult> ModifyReview(string id, [FromBody] ReviewUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid review ID format");

        var review = await _reviewRepository.GetByIdAsync(objectId);
        if (review == null)
            throw new NotFoundException("Review not found");

        var reviewerId = GetUserIdFromToken();
        if (review.ReviewerId != reviewerId)
            throw new UnauthorizedException("You are not authorized to modify this review");

        review.Rating = request.Rating;
        review.ReviewText = request.ReviewText;

        await _reviewRepository.UpdateAsync(objectId, review);
        return Ok(new { message = "Review modified successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new ValidationException("Invalid review ID format");

        var review = await _reviewRepository.GetByIdAsync(objectId);
        if (review == null)
            throw new NotFoundException("Review not found");

        var userId = GetUserIdFromToken();
        if (review.ReviewerId != userId)
            throw new UnauthorizedException("You are not authorized to delete this review");

        await _reviewRepository.DeleteAsync(objectId);
        return Ok(new { message = "Review deleted successfully" });
    }

    private ObjectId GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst("userId");
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedException("Invalid user token");

        return userId;
    }
}