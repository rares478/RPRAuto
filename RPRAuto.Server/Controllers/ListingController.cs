using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Classes;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("listing")]
public class ListingController : ControllerBase
{
    private readonly IMongoCollection<Listing> _listingsCollection;
    private readonly IMongoCollection<User> _usersCollection;

    public ListingController(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("RPR");
        _listingsCollection = database.GetCollection<Listing>("Listings");
        _usersCollection = database.GetCollection<User>("Users");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid ID format" });
        
        var listing = await _listingsCollection.Find(l => l.Id == objectId).FirstOrDefaultAsync();
        
        if (listing == null)
            return NotFound(new { status = 404, message = "Listing not found" });
        
        var seller = await _usersCollection.Find(u => u.UserId == listing.uId).FirstOrDefaultAsync();
        
        if (seller == null)
            return NotFound(new { status = 404, message = "Seller information not found" });
        
        var response = new
        {
            price = listing.Price,
            car = listing.Car,
            sellerFirstName = seller.Personal.FirstName
        };
        
        return Ok(response);
    }
    
    [HttpDelete]
    public async Task<IActionResult> Delete(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid ID format" });
        
        var result = await _listingsCollection.DeleteOneAsync(l => l.Id == objectId);
        
        if (result.DeletedCount == 0)
            return NotFound(new { status = 404, message = "Listing not found" });
        
        return Ok(new { status = 200, message = "Listing deleted successfully" });
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ListingUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid ID format" });
        
        var listing = await _listingsCollection.Find(l => l.Id == objectId).FirstOrDefaultAsync();
        
        if (listing == null)
            return NotFound(new { status = 404, message = "Listing not found" });
        
        // Update listing properties
        var update = Builders<Listing>.Update
            .Set(l => l.Price, request.Price)
            .Set(l => l.Car, request.Car);
        
        await _listingsCollection.UpdateOneAsync(l => l.Id == objectId, update);
        
        return Ok(new { status = 200, message = "Listing updated successfully" });
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ListingCreateRequest request)
    {
        if (request == null)
            return BadRequest(new { status = 400, message = "Invalid request" });
        
        var listing = new Listing
        {
            Price = request.Price,
            Car = request.Car,
            uId = request.UserId
        };
        
        await _listingsCollection.InsertOneAsync(listing);
        
        return Ok(new { status = 200, message = "Listing created successfully" });
    }
    
    [HttpGet]
    public async Task<IActionResult> GetListings()
    {
        var listings = await _listingsCollection.Find(_ => true).Limit(30).ToListAsync();
        
        if (listings == null || listings.Count == 0)
            return NotFound(new { status = 404, message = "No listings found" });
        
        var response = listings.Select(l => new
        {
            id = l.Id.ToString(),
            price = l.Price,
            car = l.Car
        });
        
        return Ok(response);
    }
    
    [HttpPost("{id}/purchase")]
    public async Task<IActionResult> Buy(string id, [FromBody] ListingPurchaseRequest request)
    {
        if (!ObjectId.TryParse(id, out var listingId))
            return BadRequest(new { status = 400, message = "Invalid listing ID format" });
        
        if (!ObjectId.TryParse(request.UserId, out var buyerId))
            return BadRequest(new { status = 400, message = "Invalid buyer ID format" });

        var listing = await _listingsCollection.Find(l => l.Id == listingId).FirstOrDefaultAsync();
    
        if (listing == null)
            return NotFound(new { status = 404, message = "Listing not found" });

        // TODO: Implement purchase logic here
    
        return Ok(new { status = 200, message = "Purchase successful" });
    }
    
    
}