using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Review;

namespace RPRAuto.Server.Repositories;

public class ReviewRepository : MongoRepository<Review>, IReviewRepository
{
    public ReviewRepository(IMongoClient mongoClient) 
        : base(mongoClient, "RPR", "Reviews")
    {
    }

    public async Task<IEnumerable<Review>> GetRecentReviewsAsync(int count)
    {
        var sort = Builders<Review>.Sort.Descending(r => r.CreatedAt);
        return await _collection.Find(_ => true)
            .Sort(sort)
            .Limit(count)
            .ToListAsync();
    }
    
    public async Task<bool> HasUserReviewedAsync(ObjectId userId)
    {
        var filter = Builders<Review>.Filter.Eq(r => r.ReviewerId, userId);
        var review = await _collection.Find(filter).FirstOrDefaultAsync();
        return review != null;
    }
    
    public async Task<IEnumerable<Review>> GetLatestReviewsAsync(int count)
    {
        var sort = Builders<Review>.Sort.Descending(r => r.CreatedAt);
        return await _collection.Find(_ => true)
            .Sort(sort)
            .Limit(count)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Review>> GetByUserIdAsync(ObjectId userId)
    {
        var filter = Builders<Review>.Filter.Eq(r => r.ReviewerId, userId);
        return await _collection.Find(filter).ToListAsync();
    }
}