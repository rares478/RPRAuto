using MongoDB.Bson;

namespace RPRAuto.Server.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(ObjectId id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(ObjectId id, T entity);
    Task DeleteAsync(ObjectId id);
    Task<bool> ExistsAsync(ObjectId id);
} 