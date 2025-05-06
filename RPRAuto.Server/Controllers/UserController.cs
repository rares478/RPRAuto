using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Classes;
using Microsoft.AspNetCore.Authorization;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<Bid> _bidsCollection;
    private readonly IMongoCollection<Listing> _listingsCollection;
    private readonly IMongoCollection<Review> _reviewsCollection;

    public UserController(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("RPR");
        _usersCollection = database.GetCollection<User>("Users");
        _bidsCollection = database.GetCollection<Bid>("Bids");
        _listingsCollection = database.GetCollection<Listing>("Listings");
        _reviewsCollection = database.GetCollection<Review>("Reviews");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        // Don't return password in response
        user.Login.Password = null;

        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ModifyUser(string id, [FromBody] UserUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        var update = Builders<User>.Update;
        var updateBuilder = update.Set(u => u.Personal.FirstName, request.FirstName)
                                 .Set(u => u.Personal.LastName, request.LastName)
                                 .Set(u => u.Personal.PhoneNumber, request.PhoneNumber)
                                 .Set(u => u.Personal.Address, request.Address)
                                 .Set(u => u.Personal.City, request.City)
                                 .Set(u => u.Personal.Country, request.Country);

        await _usersCollection.UpdateOneAsync(u => u.UserId == objectId, updateBuilder);

        return Ok(new { status = 200, message = "User updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var result = await _usersCollection.DeleteOneAsync(u => u.UserId == objectId);

        if (result.DeletedCount == 0)
            return NotFound(new { status = 404, message = "User not found" });

        return Ok(new { status = 200, message = "User deleted successfully" });
    }

    [HttpGet("{id}/listings")]
    public async Task<IActionResult> GetAllListings(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        var listings = await _listingsCollection.Find(l => user.Listings.Contains(l.Id)).ToListAsync();

        return Ok(listings);
    }

    [HttpGet("{id}/bids")]
    public async Task<IActionResult> GetAllBids(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        var bids = await _bidsCollection.Find(b => user.Bids.Contains(b.Id)).ToListAsync();

        return Ok(bids);
    }

    [HttpGet("{id}/login")]
    public async Task<IActionResult> GetLoginDetails(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId)
            .Project<LoginDetailsResponse>(Builders<User>.Projection
                .Include(u => u.Login.Email)
                .Exclude(u => u.Login.Password))
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        return Ok(user);
    }

    [HttpGet("{id}/personal")]
    public async Task<IActionResult> GetPersonalDetails(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId)
            .Project<PersonalDetailsResponse>(Builders<User>.Projection
                .Include(u => u.Personal))
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        return Ok(user);
    }

    [HttpPut("{id}/review")]
    public async Task<IActionResult> AddReview(string id, [FromBody] ReviewRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });

        var review = new Review
        {
            UserId = objectId,
            ReviewText = request.Review,
            Rating = request.Rating,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewsCollection.InsertOneAsync(review);

        // Add review ID to user's reviews list
        user.Review = review.ReviewId;
        await _usersCollection.UpdateOneAsync(
            u => u.UserId == objectId,
            Builders<User>.Update.Set(u => u.Review, user.Review)
        );

        return Ok(new { status = 200, message = "Review added successfully" });
    }

    [HttpGet("{id}/review")]
    public async Task<IActionResult> GetReviews(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { status = 404, message = "User not found" });
        
        return Ok(user.Review);
    }
    
}

