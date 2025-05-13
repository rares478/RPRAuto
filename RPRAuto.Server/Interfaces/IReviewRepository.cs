using MongoDB.Bson;
using RPRAuto.Server.Models.Review;

namespace RPRAuto.Server.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<IEnumerable<Review>> GetByUserIdAsync(ObjectId userId);
    Task<IEnumerable<Review>> GetRecentReviewsAsync(int count);
    Task<bool> HasUserReviewedAsync(ObjectId userId);
    Task<IEnumerable<Review>> GetLatestReviewsAsync(int count);
} 