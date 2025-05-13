using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Car;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.Bid;

public class Bid : IBid
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId UserId { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;
    
    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;
    
    [BsonElement("status")]
    public BidStatus Status { get; set; } = BidStatus.Active;

    [BsonElement("topBid")]
    public decimal TopBid { get; set; }

    [BsonElement("minBid")]
    public decimal MinBid { get; set; }

    [BsonElement("bids")]
    public Dictionary<ObjectId, decimal> Bids { get; set; } = new();

    [BsonElement("instantBuy")]
    public decimal InstantBuy { get; set; }

    [BsonElement("car")]
    public ICar Car { get; set; } = new Car.Car();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("endAt")]
    public DateTime EndAt { get; set; }
} 