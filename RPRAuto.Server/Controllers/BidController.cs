using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Classes;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("bid")]
public class BidController : ControllerBase
{
    private readonly IMongoCollection<Bid> _bidsCollection;
    private readonly IMongoCollection<User> _usersCollection;

    public BidController(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("RPR");
        _bidsCollection = database.GetCollection<Bid>("Bids");
        _usersCollection = database.GetCollection<User>("Users");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid bid ID format" });

        var bid = await _bidsCollection.Find(b => b.Id == objectId).FirstOrDefaultAsync();

        if (bid == null)
            return NotFound(new { status = 404, message = "Bid not found" });

        var seller = await _usersCollection.Find(u => u.UserId == bid.uId).FirstOrDefaultAsync();

        if (seller == null)
            return NotFound(new { status = 404, message = "Seller information not found" });

        var response = new
        {
            sellerFirstName = seller.Personal.FirstName,
            title = bid.Title,
            topBid = bid.TopBid,
            minBid = bid.MinBid,
            instantBuy = bid.InstantBuy,
            car = bid.Car,
            createdAt = bid.CreatedAt,
            endAt = bid.EndAt,
        };

        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] BidUpdateRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid bid ID format" });

        var bid = await _bidsCollection.Find(b => b.Id == objectId).FirstOrDefaultAsync();
        if (bid == null)
            return NotFound(new { status = 404, message = "Bid listing not found" });

        // Update bid listing properties
        var update = Builders<Bid>.Update
            .Set(b => b.MinBid, request.MinBid)
            .Set(b => b.InstantBuy, request.InstantBuy)
            .Set(b => b.Title, request.Title);

        await _bidsCollection.UpdateOneAsync(b => b.Id == objectId, update);

        return Ok(new { status = 200, message = "Bid listing updated successfully" });
    }

    [HttpPost("{id}/place")]
    public async Task<IActionResult> PlaceBid(string id, [FromBody] PlaceBidRequest request)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid bid ID format" });

        if (!ObjectId.TryParse(request.UserId, out var userId))
            return BadRequest(new { status = 400, message = "Invalid user ID format" });

        var bid = await _bidsCollection.Find(b => b.Id == objectId).FirstOrDefaultAsync();
        if (bid == null)
            return NotFound(new { status = 404, message = "Bid listing not found" });

        // Validate bid amount
        if (request.Amount < bid.MinBid || (bid.TopBid > 0 && request.Amount <= bid.TopBid))
            return BadRequest(new { status = 400, message = "Bid amount too low" });
        
        if(DateTime.UtcNow > bid.EndAt)
            return BadRequest(new { status = 400, message = "Bid listing has expired" });

        // Check for instant buy
        if (request.Amount >= bid.InstantBuy && bid.InstantBuy > 0)
        {
            // TODO: Handle instant buy logic
        }

        // Update bid dictionary and top bid
        var update = Builders<Bid>.Update
            .Set(b => b.Bids[userId], request.Amount)
            .Set(b => b.TopBid, request.Amount);

        await _bidsCollection.UpdateOneAsync(b => b.Id == objectId, update);

        return Ok(new { status = 200, message = "Bid placed successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return BadRequest(new { status = 400, message = "Invalid bid ID format" });

        var result = await _bidsCollection.DeleteOneAsync(b => b.Id == objectId);

        if (result.DeletedCount == 0)
            return NotFound(new { status = 404, message = "Bid listing not found" });

        return Ok(new { status = 200, message = "Bid listing deleted successfully" });
    }
    
    [HttpGet]
    public async Task<IActionResult> GetBidListings()
    {
        var bids = await _bidsCollection.Find(_ => true).Limit(30).ToListAsync();
        return Ok(bids);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BidCreateRequest request)
    {
        if (request == null)
            return BadRequest(new { status = 400, message = "Invalid request" });

        var bid = new Bid
        {
            uId = request.UserId,
            Title = request.Title,
            TopBid = request.TopBid,
            MinBid = request.MinBid,
            InstantBuy = request.InstantBuy,
            Car = request.Car,
            CreatedAt = DateTime.UtcNow,
            EndAt = request.EndAt
        };

        await _bidsCollection.InsertOneAsync(bid);

        return Ok(new { status = 200, message = "Bid listing created successfully" });
    }
    
}