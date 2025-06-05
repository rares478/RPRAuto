using MongoDB.Bson;
using RPRAuto.Server.Models.Review;

namespace RPRAuto.Server.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<Review> GetByIdAsync(ObjectId id);
    Task<IEnumerable<Review>> GetAllAsync();
    Task<Review> CreateAsync(Review review);
    Task UpdateAsync(ObjectId id, Review review);
    Task DeleteAsync(ObjectId id);
    Task<Review> GetByTransactionAndUserAsync(ObjectId transactionId, ObjectId userId);
    Task<IEnumerable<Review>> GetBySellerAsync(ObjectId sellerId);
    Task<IEnumerable<Review>> GetByUserIdAsync(ObjectId userId);
    Task<IEnumerable<Review>> GetBySellerIdAsync(ObjectId sellerId);
    Task<IEnumerable<Review>> GetRecentReviewsAsync(int count);
    Task<bool> HasUserReviewedTransactionAsync(ObjectId userId, ObjectId transactionId);
    Task<IEnumerable<Review>> GetLatestReviewsAsync(int count);
} 