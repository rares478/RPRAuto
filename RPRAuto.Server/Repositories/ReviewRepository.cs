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

    public async Task<Review> GetByTransactionAndUserAsync(ObjectId transactionId, ObjectId userId)
    {
        return await _collection.Find(r => r.TransactionId == transactionId && r.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Review>> GetBySellerAsync(ObjectId sellerId)
    {
        return await _collection.Find(r => r.SellerId == sellerId).ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByUserIdAsync(ObjectId userId)
    {
        return await _collection.Find(r => r.UserId == userId).ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetBySellerIdAsync(ObjectId sellerId)
    {
        return await _collection.Find(r => r.SellerId == sellerId).ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetRecentReviewsAsync(int count)
    {
        return await _collection.Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .Limit(count)
            .ToListAsync();
    }

    public async Task<bool> HasUserReviewedTransactionAsync(ObjectId userId, ObjectId transactionId)
    {
        return await _collection.CountDocumentsAsync(r => r.UserId == userId && r.TransactionId == transactionId) > 0;
    }

    public async Task<IEnumerable<Review>> GetLatestReviewsAsync(int count)
    {
        return await _collection.Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .Limit(count)
            .ToListAsync();
    }
}