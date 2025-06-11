using MongoDB.Bson;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Models.Listing;
using RPRAuto.Server.Models.Review;
using RPRAuto.Server.Models.User;

namespace RPRAuto.Server.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<Listing>> GetUserListingsAsync(ObjectId userId);
    Task<IEnumerable<Bid>> GetUserBidsAsync(ObjectId userId);
    Task<IEnumerable<ObjectId>> GetUserPurchasesAsync(ObjectId userId);
    Task<Review?> GetUserReviewAsync(ObjectId userId);
    Task AddUserReviewAsync(ObjectId userId, Review review);
    Task<bool> VerifyPasswordAsync(string email, string password);
    Task<bool> UpdatePasswordAsync(ObjectId userId, string newHashedPassword);
    Task UpdateUserRatingAsync(ObjectId userId, double newRating);
} 