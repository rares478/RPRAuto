using MongoDB.Bson;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Interfaces;

public interface IBidRepository : IRepository<Bid>
{
    Task<IEnumerable<Bid>> GetByListingIdAsync(ObjectId listingId);
    Task<IEnumerable<Bid>> GetByUserIdAsync(ObjectId userId);
    Task<Bid?> GetHighestBidForListingAsync(ObjectId listingId);
    Task<bool> HasUserBidOnListingAsync(ObjectId userId, ObjectId listingId);
    Task UpdateBidStatusAsync(ObjectId id, BidStatus status);
    Task<IEnumerable<Bid>> GetLatestBidsAsync(int count);
    Task<(IEnumerable<Bid> Bids, long TotalCount)> GetBidsByPageAsync(int page, int pageSize);
} 