using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.Review;

public class Review : IReview
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId ReviewId { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId UserId { get; set; }  // The reviewer (buyer)

    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId SellerId { get; set; }  // The seller being reviewed

    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId TransactionId { get; set; }  // The listing or bid ID

    public TransactionType TransactionType { get; set; }  // Whether it was a listing or bid

    public int rating { get; set; }  // 1-5 stars
    public DateTime CreatedAt { get; set; }
}