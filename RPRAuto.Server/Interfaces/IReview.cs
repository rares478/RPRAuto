using MongoDB.Bson;

namespace RPRAuto.Server.Classes;

public interface IReview
{
    ObjectId UserId { get; set; }
    string review { get; set; }
    int rating { get; set; }
    DateTime CreatedAt { get; set; }
}