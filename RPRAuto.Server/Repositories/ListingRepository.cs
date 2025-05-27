using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;
using RPRAuto.Server.Models.Listing;

namespace RPRAuto.Server.Repositories;

public class ListingRepository : MongoRepository<Listing>, IListingRepository
{
    public ListingRepository(IMongoClient mongoClient) 
        : base(mongoClient, "RPR", "Listings")
    {
    }

    public async Task<IEnumerable<Listing>> GetByUserIdAsync(ObjectId userId)
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.UserId, userId);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetActiveListingsAsync()
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.Status, ListingStatus.Active);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetByCarMakeAsync(string make)
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.Car.Make, make);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetByCarModelAsync(string model)
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.Car.Model, model);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetByPriceRangeAsync(decimal minPrice, decimal maxPrice)
    {
        var filter = Builders<Listing>.Filter.And(
            Builders<Listing>.Filter.Gte(l => l.Price, minPrice),
            Builders<Listing>.Filter.Lte(l => l.Price, maxPrice)
        );
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetByYearRangeAsync(int minYear, int maxYear)
    {
        var filter = Builders<Listing>.Filter.And(
            Builders<Listing>.Filter.Gte(l => l.Car.Year, minYear),
            Builders<Listing>.Filter.Lte(l => l.Car.Year, maxYear)
        );
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task UpdateStatusAsync(ObjectId id, ListingStatus status)
    {
        var filter = Builders<Listing>.Filter.Eq("_id", id);
        var update = Builders<Listing>.Update.Set(l => l.Status, status);
        await _collection.UpdateOneAsync(filter, update);
    }

    public async Task<IEnumerable<Listing>> SearchAsync(FilterDefinition<Listing> filter)
    {
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<(IEnumerable<Listing> Listings, long TotalCount)> GetListingsByPageAsync(int page, int pageSize)
    {
        var filter = Builders<Listing>.Filter.Eq(l => l.Status, ListingStatus.Active);
        var sort = Builders<Listing>.Sort.Descending(l => l.CreatedAt);
        
        var totalCount = await _collection.CountDocumentsAsync(filter);
        
        var listings = await _collection.Find(filter)
            .Sort(sort)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
            
        return (listings, totalCount);
    }

    public IMongoCollection<Listing> GetCollection()
    {
        return _collection;
    }
} 