using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Classes;

namespace RPRAuto.Server.Controllers;

public class ReviewController : ControllerBase
{
    private readonly IMongoCollection<Review> _reviewsCollection;

    public ReviewController(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("RPR");
        _reviewsCollection = database.GetCollection<Review>("Reviews");
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews()
    {
        var reviews = await _reviewsCollection.Find(_ => true).Limit(30).ToListAsync();

        if (reviews == null || !reviews.Any())
            return NotFound(new { status = 404, message = "No reviews found" });

        return Ok(reviews);
    }
    
    [HttpPut("{id}/modify")]
    public async Task<IActionResult> ModifyReview(string id, [FromBody] Review review)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid review ID format" });

        var existingReview = await _reviewsCollection.Find(r => r.UserId == objectId).FirstOrDefaultAsync();
        if (existingReview == null)
            return NotFound(new { status = 404, message = "Review not found" });

        var update = Builders<Review>.Update
            .Set(r => r.ReviewText, review.ReviewText)
            .Set(r => r.Rating, review.Rating);

        await _reviewsCollection.UpdateOneAsync(r => r.UserId == objectId, update);

        return Ok(new { status = 200, message = "Review updated successfully" });
    }
    
    [HttpPut("{id}/delete")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid review ID format" });

        var result = await _reviewsCollection.DeleteOneAsync(r => r.UserId == objectId);

        if (result.DeletedCount == 0)
            return NotFound(new { status = 404, message = "Review not found" });

        return Ok(new { status = 200, message = "Review deleted successfully" });
    }
    
    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] Review review)
    {
        if (review == null)
            return BadRequest(new { status = 400, message = "Invalid review data" });

        await _reviewsCollection.InsertOneAsync(review);

        return CreatedAtAction(nameof(GetReviews), new { id = review.ReviewId }, review);
    }
    
}