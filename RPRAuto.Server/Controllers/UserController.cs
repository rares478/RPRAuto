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

    public UserController(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("RPR");
        _usersCollection = database.GetCollection<User>("Users");
        _bidsCollection = database.GetCollection<Bid>("Bids");
        _listingsCollection = database.GetCollection<Listing>("Listings");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "User not found" });

        // Don't return password in response
        user.Login.Password = null;

        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ModifyUser(string id, [FromBody] UserUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { message = "User not found" });

        var update = Builders<User>.Update;
        var updateBuilder = update.Set(u => u.Personal.FirstName, request.FirstName)
                                 .Set(u => u.Personal.LastName, request.LastName)
                                 .Set(u => u.Personal.PhoneNumber, request.PhoneNumber)
                                 .Set(u => u.Personal.Address, request.Address)
                                 .Set(u => u.Personal.City, request.City)
                                 .Set(u => u.Personal.Country, request.Country);

        await _usersCollection.UpdateOneAsync(u => u.UserId == objectId, updateBuilder);

        return Ok(new { message = "User updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var result = await _usersCollection.DeleteOneAsync(u => u.UserId == objectId);

        if (result.DeletedCount == 0)
            return NotFound(new { message = "User not found" });

        return Ok(new { message = "User deleted successfully" });
    }

    [HttpGet("{id}/listings")]
    public async Task<IActionResult> GetAllListings(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { message = "User not found" });

        var listings = await _listingsCollection.Find(l => user.Listings.Contains(l.Id)).ToListAsync();

        return Ok(listings);
    }

    [HttpGet("{id}/bids")]
    public async Task<IActionResult> GetAllBids(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { message = "User not found" });

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
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }

    [HttpGet("{id}/personal")]
    public async Task<IActionResult> GetPersonalDetails(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { message = "Invalid user ID format" });

        var user = await _usersCollection.Find(u => u.UserId == objectId)
            .Project<PersonalDetailsResponse>(Builders<User>.Projection
                .Include(u => u.Personal))
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }
}

