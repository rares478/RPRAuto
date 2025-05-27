using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Car;
using RPRAuto.Server.Models.Enums;
using System.Text.Json.Serialization;

namespace RPRAuto.Server.Models.Bid;

public class Bid : IBid
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("Id")]
    public ObjectId Id { get; set; }

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("UserId")]
    public ObjectId UserId { get; set; }

    [BsonElement("title")]
    [JsonPropertyName("Title")]
    public string Title { get; set; } = string.Empty;
    
    [BsonElement("description")]
    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;
    
    [BsonElement("status")]
    [JsonPropertyName("Status")]
    public BidStatus Status { get; set; } = BidStatus.Active;

    [BsonElement("topBid")]
    [JsonPropertyName("TopBid")]
    public decimal TopBid { get; set; }

    [BsonElement("minBid")]
    [JsonPropertyName("MinBid")]
    public decimal MinBid { get; set; }

    [BsonElement("bids")]
    [JsonPropertyName("Bids")]
    public Dictionary<ObjectId, decimal> Bids { get; set; } = new();

    [BsonElement("instantBuy")]
    [JsonPropertyName("InstantBuy")]
    public decimal InstantBuy { get; set; }

    [BsonElement("car")]
    [BsonSerializer(typeof(CarSerializer))]
    [JsonPropertyName("Car")]
    public ICar Car { get; set; } = new Car.Car();

    [BsonElement("createdAt")]
    [JsonPropertyName("CreatedAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("endAt")]
    [JsonPropertyName("EndAt")]
    public DateTime EndAt { get; set; }
} 