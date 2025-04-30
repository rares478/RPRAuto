using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RPRAuto.Server.Classes;

public class Review : IReview
{
    [BsonId]
    public ObjectId ReviewId { get; set; }
    public ObjectId UserId { get; set; }
    public string ReviewText { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Helper properties to maintain compatibility
    [BsonIgnore]
    public string review
    {
        get => ReviewText;
        set => ReviewText = value;
    }

    [BsonIgnore]
    public int rating
    {
        get => Rating;
        set => Rating = value;
    }   
}

public class ReviewRequest
{
    public string Review { get; set; }
    public int Rating { get; set; }
}