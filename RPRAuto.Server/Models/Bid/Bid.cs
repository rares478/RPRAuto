using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Car;
using RPRAuto.Server.Models.Enums;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RPRAuto.Server.Models.Bid;

public class ObjectIdConverter : JsonConverter<ObjectId>
{
    public override ObjectId Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return ObjectId.Parse(value);
    }

    public override void Write(Utf8JsonWriter writer, ObjectId value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}

public class Bid : IBid
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("Id")]
    [JsonConverter(typeof(ObjectIdConverter))]
    public ObjectId Id { get; set; }

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("UserId")]
    [JsonConverter(typeof(ObjectIdConverter))]
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