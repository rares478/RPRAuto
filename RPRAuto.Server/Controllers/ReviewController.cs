using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Review;
using RPRAuto.Server.Exceptions;
using System.Security.Claims;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("review")]
public class ReviewController : ControllerBase
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IUserRepository _userRepository;
    private readonly IListingRepository _listingRepository;
    private readonly IBidRepository _bidRepository;
    private readonly ILogger<ReviewController> _logger;

    public ReviewController(
        IReviewRepository reviewRepository, 
        IUserRepository userRepository,
        IListingRepository listingRepository,
        IBidRepository bidRepository,
        ILogger<ReviewController> logger)
    {
        _reviewRepository = reviewRepository;
        _userRepository = userRepository;
        _listingRepository = listingRepository;
        _bidRepository = bidRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews()
    {
        var reviews = await _reviewRepository.GetLatestReviewsAsync(30);
        return Ok(reviews);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserReviews(string userId)
    {
        if (!ObjectId.TryParse(userId, out var objectId))
        {
            return BadRequest(new { message = "Invalid user ID format" });
        }

        var reviews = await _reviewRepository.GetByUserIdAsync(objectId);
        return Ok(reviews);
    }

    [HttpGet("seller/{sellerId}")]
    public async Task<IActionResult> GetSellerReviews(string sellerId)
    {
        if (!ObjectId.TryParse(sellerId, out var objectId))
        {
            return BadRequest(new { message = "Invalid seller ID format" });
        }

        var reviews = await _reviewRepository.GetBySellerIdAsync(objectId);
        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewRequest request)
    {
        try
        {
            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5 stars" });
            }

            var userId = GetUserIdFromToken();
            _logger.LogInformation("Adding review for transaction: {TransactionId}", request.TransactionId);

            if (!ObjectId.TryParse(request.TransactionId, out var transactionId))
            {
                return BadRequest(new { message = "Invalid transaction ID format" });
            }

            // Check if user has already reviewed this transaction
            if (await _reviewRepository.HasUserReviewedTransactionAsync(userId, transactionId))
            {
                _logger.LogWarning("User {UserId} has already reviewed transaction {TransactionId}", userId, transactionId);
                return BadRequest(new { message = "You have already reviewed this transaction" });
            }

            // Verify the transaction and get seller ID
            ObjectId sellerId;
            if (request.TransactionType == TransactionType.Listing)
            {
                var listing = await _listingRepository.GetByIdAsync(transactionId);
                if (listing == null)
                {
                    return NotFound(new { message = "Listing not found" });
                }
                if (listing.Status != ListingStatus.Sold)
                {
                    return BadRequest(new { message = "Cannot review an unsold listing" });
                }
                sellerId = listing.UserId;
            }
            else // Bid
            {
                var bid = await _bidRepository.GetByIdAsync(transactionId);
                if (bid == null)
                {
                    return NotFound(new { message = "Bid not found" });
                }
                if (bid.Status != BidStatus.Completed)
                {
                    return BadRequest(new { message = "Cannot review an incomplete bid" });
                }
                sellerId = bid.UserId;
            }

            // Create the review
            var review = new Review
            {
                UserId = userId,
                SellerId = sellerId,
                TransactionId = transactionId,
                TransactionType = request.TransactionType,
                rating = request.Rating,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.CreateAsync(review);
            _logger.LogInformation("Review created successfully with ID: {ReviewId}", review.ReviewId);

            // Update seller's average rating
            await UpdateSellerRating(sellerId);

            return Ok(new { message = "Review added successfully", reviewId = review.ReviewId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding review");
            return StatusCode(500, new { message = "An error occurred while adding the review" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ModifyReview(string id, [FromBody] ReviewUpdateRequest request)
    {
        try
        {
            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5 stars" });
            }

            if (!ObjectId.TryParse(id, out var objectId))
            {
                _logger.LogWarning("Invalid review ID format: {Id}", id);
                return BadRequest(new { message = "Invalid review ID format" });
            }

            var review = await _reviewRepository.GetByIdAsync(objectId);
            if (review == null)
            {
                _logger.LogWarning("Review not found with ID: {Id}", id);
                return NotFound(new { message = "Review not found" });
            }

            var userId = GetUserIdFromToken();
            if (review.UserId != userId)
            {
                _logger.LogWarning("Unauthorized attempt to modify review {ReviewId} by user {UserId}", id, userId);
                return Unauthorized(new { message = "You are not authorized to modify this review" });
            }

            review.rating = request.Rating;

            await _reviewRepository.UpdateAsync(objectId, review);
            _logger.LogInformation("Review {ReviewId} updated successfully", id);

            // Update seller's average rating
            await UpdateSellerRating(review.SellerId);

            return Ok(new { message = "Review modified successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error modifying review {Id}", id);
            return StatusCode(500, new { message = "An error occurred while modifying the review" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        try
        {
            if (!ObjectId.TryParse(id, out var objectId))
            {
                _logger.LogWarning("Invalid review ID format: {Id}", id);
                return BadRequest(new { message = "Invalid review ID format" });
            }

            var review = await _reviewRepository.GetByIdAsync(objectId);
            if (review == null)
            {
                _logger.LogWarning("Review not found with ID: {Id}", id);
                return NotFound(new { message = "Review not found" });
            }

            var userId = GetUserIdFromToken();
            if (review.UserId != userId)
            {
                _logger.LogWarning("Unauthorized attempt to delete review {ReviewId} by user {UserId}", id, userId);
                return Unauthorized(new { message = "You are not authorized to delete this review" });
            }

            await _reviewRepository.DeleteAsync(objectId);
            _logger.LogInformation("Review {ReviewId} deleted successfully", id);

            // Update seller's average rating
            await UpdateSellerRating(review.SellerId);

            return Ok(new { message = "Review deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting review {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the review" });
        }
    }

    private async Task UpdateSellerRating(ObjectId sellerId)
    {
        var reviews = await _reviewRepository.GetBySellerIdAsync(sellerId);
        if (reviews.Any())
        {
            var averageRating = reviews.Average(r => r.rating);
            var seller = await _userRepository.GetByIdAsync(sellerId);
            if (seller != null)
            {
                seller.PublicData.Rating = averageRating;
                await _userRepository.UpdateAsync(sellerId, seller);
            }
        }
    }

    private ObjectId GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !ObjectId.TryParse(userIdClaim.Value, out var userId))
        {
            _logger.LogError("Invalid user token - missing or invalid user ID claim");
            throw new UnauthorizedException("Invalid user token");
        }
        return userId;
    }
}