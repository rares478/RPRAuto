using MongoDB.Bson;

namespace RPRAuto.Server.Interfaces;

public interface IReview
{
    ObjectId ReviewId { get; set; }
    ObjectId UserId { get; set; }
    string review { get; set; }
    int rating { get; set; }
    DateTime CreatedAt { get; set; }
}