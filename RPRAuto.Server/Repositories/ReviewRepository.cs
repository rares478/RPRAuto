using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Review;

namespace RPRAuto.Server.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly IMongoCollection<Review> _reviews;

    public ReviewRepository(IMongoDatabase database)
    {
        _reviews = database.GetCollection<Review>("reviews");
    }

    public async Task<Review> GetByIdAsync(ObjectId id)
    {
        return await _reviews.Find(r => r.ReviewId == id).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Review>> GetAllAsync()
    {
        return await _reviews.Find(_ => true).ToListAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        await _reviews.InsertOneAsync(review);
        return review;
    }

    public async Task UpdateAsync(ObjectId id, Review review)
    {
        await _reviews.ReplaceOneAsync(r => r.ReviewId == id, review);
    }

    public async Task DeleteAsync(ObjectId id)
    {
        await _reviews.DeleteOneAsync(r => r.ReviewId == id);
    }

    public async Task<bool> ExistsAsync(ObjectId id)
    {
        return await _reviews.CountDocumentsAsync(r => r.ReviewId == id) > 0;
    }

    public async Task<Review> GetByTransactionAndUserAsync(ObjectId transactionId, ObjectId userId)
    {
        return await _reviews.Find(r => r.TransactionId == transactionId && r.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Review>> GetBySellerAsync(ObjectId sellerId)
    {
        return await _reviews.Find(r => r.SellerId == sellerId).ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByUserIdAsync(ObjectId userId)
    {
        return await _reviews.Find(r => r.UserId == userId).ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetBySellerIdAsync(ObjectId sellerId)
    {
        return await _reviews.Find(r => r.SellerId == sellerId).ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetRecentReviewsAsync(int count)
    {
        return await _reviews.Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .Limit(count)
            .ToListAsync();
    }

    public async Task<bool> HasUserReviewedTransactionAsync(ObjectId userId, ObjectId transactionId)
    {
        return await _reviews.CountDocumentsAsync(r => r.UserId == userId && r.TransactionId == transactionId) > 0;
    }

    public async Task<IEnumerable<Review>> GetLatestReviewsAsync(int count)
    {
        return await _reviews.Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .Limit(count)
            .ToListAsync();
    }
}