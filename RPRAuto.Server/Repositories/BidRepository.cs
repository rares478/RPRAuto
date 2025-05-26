using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Repositories;

public class BidRepository : MongoRepository<Bid>, IBidRepository
{
    public BidRepository(IMongoClient mongoClient) 
        : base(mongoClient, "RPR", "Bids")
    {
    }

    public async Task<IEnumerable<Bid>> GetByListingIdAsync(ObjectId listingId)
    {
        var filter = Builders<Bid>.Filter.Eq(b => b.Id, listingId);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Bid>> GetByUserIdAsync(ObjectId userId)
    {
        var filter = Builders<Bid>.Filter.Eq(b => b.UserId, userId);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<Bid?> GetHighestBidForListingAsync(ObjectId listingId)
    {
        var filter = Builders<Bid>.Filter.Eq(b => b.Id, listingId);
        var sort = Builders<Bid>.Sort.Descending(b => b.TopBid);
        return await _collection.Find(filter).Sort(sort).FirstOrDefaultAsync();
    }

    public async Task<bool> HasUserBidOnListingAsync(ObjectId userId, ObjectId listingId)
    {
        var filter = Builders<Bid>.Filter.And(
            Builders<Bid>.Filter.Eq(b => b.UserId, userId),
            Builders<Bid>.Filter.Eq(b => b.Id, listingId)
        );
        return await _collection.CountDocumentsAsync(filter) > 0;
    }
    
    public async Task<IEnumerable<Bid>> GetLatestBidsAsync(int count)
    {
        var sort = Builders<Bid>.Sort.Descending(b => b.CreatedAt);
        return await _collection.Find(_ => true)
            .Sort(sort)
            .Limit(count)
            .ToListAsync();
    }

    public async Task UpdateBidStatusAsync(ObjectId id, BidStatus status)
    {
        var filter = Builders<Bid>.Filter.Eq("_id", id);
        var update = Builders<Bid>.Update
            .Set(b => b.Status, status);
        await _collection.UpdateOneAsync(filter, update);
    }

    public async Task<(IEnumerable<Bid> Bids, long TotalCount)> GetBidsByPageAsync(int page, int pageSize)
    {
        var filter = Builders<Bid>.Filter.Eq(b => b.Status, BidStatus.Active);
        var sort = Builders<Bid>.Sort.Descending(b => b.CreatedAt);
        
        var totalCount = await _collection.CountDocumentsAsync(filter);
        
        var bids = await _collection.Find(filter)
            .Sort(sort)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
            
        return (bids, totalCount);
    }
} 