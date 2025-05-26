using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Car;

namespace RPRAuto.Server.Models.Listing;

public class Listing : IListing
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

    [BsonElement("price")]
    [JsonPropertyName("Price")]
    public decimal Price { get; set; }

    [BsonElement("car")]
    [BsonSerializer(typeof(CarSerializer))]
    [JsonPropertyName("Car")]
    public ICar Car { get; set; } = new Car.Car();
    
    [BsonElement("status")]
    [JsonPropertyName("Status")]
    public Enums.ListingStatus Status { get; set; } = Enums.ListingStatus.Active;
    
    [BsonElement("description")]
    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    [JsonPropertyName("CreatedAt")]
    public DateTime CreatedAt { get; set; }
} 