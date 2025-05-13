using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RPRAuto.Server.Models.Review;

public class Review
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId ReviewId { get; set; }

    [BsonElement("reviewerId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId ReviewerId { get; set; }

    [BsonElement("rating")]
    public int Rating { get; set; }

    [BsonElement("reviewText")]
    public string ReviewText { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}