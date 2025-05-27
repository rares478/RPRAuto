using MongoDB.Bson;
using RPRAuto.Server.Models.Enums;
using RPRAuto.Server.Models.Listing;
using MongoDB.Driver;

namespace RPRAuto.Server.Interfaces;

public interface IListingRepository : IRepository<Listing>
{
    Task<IEnumerable<Listing>> GetByUserIdAsync(ObjectId userId);
    Task<IEnumerable<Listing>> GetActiveListingsAsync();
    Task<IEnumerable<Listing>> GetByCarMakeAsync(string make);
    Task<IEnumerable<Listing>> GetByCarModelAsync(string model);
    Task<IEnumerable<Listing>> GetByPriceRangeAsync(decimal minPrice, decimal maxPrice);
    Task<IEnumerable<Listing>> GetByYearRangeAsync(int minYear, int maxYear);
    Task UpdateStatusAsync(ObjectId id, ListingStatus status);
    Task<IEnumerable<Listing>> SearchAsync(FilterDefinition<Listing> filter);
    Task<(IEnumerable<Listing> Listings, long TotalCount)> GetListingsByPageAsync(int page, int pageSize);
    IMongoCollection<Listing> GetCollection();
} 