using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Models.Listing;
using RPRAuto.Server.Models.Review;
using RPRAuto.Server.Models.User;

namespace RPRAuto.Server.Repositories;

public class UserRepository : MongoRepository<User>, IUserRepository
{
    private readonly IMongoCollection<Listing> _listingsCollection;
    private readonly IMongoCollection<Bid> _bidsCollection;
    private readonly IMongoCollection<Review> _reviewsCollection;

    public UserRepository(IMongoClient mongoClient) 
        : base(mongoClient, "RPR", "Users")
    {
        var database = mongoClient.GetDatabase("RPR");
        _listingsCollection = database.GetCollection<Listing>("Listings");
        _bidsCollection = database.GetCollection<Bid>("Bids");
        _reviewsCollection = database.GetCollection<Review>("Reviews");
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var filter = Builders<User>.Filter.Eq("PrivateData.Login.Email", email);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Listing>> GetUserListingsAsync(ObjectId userId)
    {
        var user = await GetByIdAsync(userId);
        if (user == null) return Enumerable.Empty<Listing>();

        var filter = Builders<Listing>.Filter.In("_id", user.Listings);
        return await _listingsCollection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Bid>> GetUserBidsAsync(ObjectId userId)
    {
        var user = await GetByIdAsync(userId);
        if (user == null) return Enumerable.Empty<Bid>();

        var filter = Builders<Bid>.Filter.In("_id", user.Bids);
        return await _bidsCollection.Find(filter).ToListAsync();
    }

    public async Task<Review?> GetUserReviewAsync(ObjectId userId)
    {
        var user = await GetByIdAsync(userId);
        if (user?.Review == null) return null;

        return await _reviewsCollection.Find(r => r.ReviewId == user.Review).FirstOrDefaultAsync();
    }

    public async Task AddUserReviewAsync(ObjectId userId, Review review)
    {
        await _reviewsCollection.InsertOneAsync(review);

        var update = Builders<User>.Update.Set(u => u.Review, review.ReviewId);
        await _collection.UpdateOneAsync(u => u.Id == userId, update);
    }

    public async Task<bool> VerifyPasswordAsync(string email, string password)
    {
        var user = await GetByEmailAsync(email);
        if (user == null) return false;

        return user.VerifyPassword(password);
    }

    public async Task<PublicUserData?> GetPublicProfileAsync(ObjectId userId)
    {
        var user = await GetByIdAsync(userId);
        return user?.PublicData;
    }

    public async Task<bool> UpdatePasswordAsync(ObjectId userId, string newHashedPassword)
    {
        var update = Builders<User>.Update
            .Set(u => u.PrivateData.Login.Password, newHashedPassword)
            .Set(u => u.UpdatedAt, DateTime.UtcNow);
        var result = await _collection.UpdateOneAsync(u => u.Id == userId, update);
        return result.ModifiedCount > 0;
    }
} 