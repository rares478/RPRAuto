using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;

namespace RPRAuto.Server.Repositories;

public class MongoRepository<T> : IRepository<T> where T : class
{
    protected readonly IMongoCollection<T> _collection;

    public MongoRepository(IMongoClient mongoClient, string databaseName, string collectionName)
    {
        var database = mongoClient.GetDatabase(databaseName);
        _collection = database.GetCollection<T>(collectionName);
    }

    public virtual async Task<T?> GetByIdAsync(ObjectId id)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public virtual async Task<T> CreateAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public virtual async Task UpdateAsync(ObjectId id, T entity)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        await _collection.ReplaceOneAsync(filter, entity);
    }

    public virtual async Task DeleteAsync(ObjectId id)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        await _collection.DeleteOneAsync(filter);
    }

    public virtual async Task<bool> ExistsAsync(ObjectId id)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        return await _collection.CountDocumentsAsync(filter) > 0;
    }
} 