using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;
using System.Text.Json.Serialization;

namespace RPRAuto.Server.Models.Car;

public class Car : ICar
{
    [BsonElement("make")]
    [JsonPropertyName("Make")]
    public string Make { get; set; } = string.Empty;

    [BsonElement("model")]
    [JsonPropertyName("Model")]
    public string Model { get; set; } = string.Empty;

    [BsonElement("year")]
    [JsonPropertyName("Year")]
    public int Year { get; set; }

    [BsonElement("description")]
    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("gearboxType")]
    [JsonPropertyName("GearboxType")]
    public GearboxType GearboxType { get; set; }

    [BsonElement("color")]
    [JsonPropertyName("Color")]
    public string Color { get; set; } = string.Empty;

    [BsonElement("doors")]
    [JsonPropertyName("Doors")]
    public int Doors { get; set; }

    [BsonElement("fuelType")]
    [JsonPropertyName("FuelType")]
    public FuelType FuelType { get; set; }

    [BsonElement("engineSize")]
    [JsonPropertyName("EngineSize")]
    public float EngineSize { get; set; }

    [BsonElement("bodyType")]
    [JsonPropertyName("BodyType")]
    public BodyType BodyType { get; set; }

    [BsonElement("horsePower")]
    [JsonPropertyName("HorsePower")]
    public int HorsePower { get; set; }

    [BsonElement("mileage")]
    [JsonPropertyName("Mileage")]
    public int Mileage { get; set; }

    [BsonElement("pictures")]
    [JsonPropertyName("Pictures")]
    public List<string> Pictures { get; set; } = new();
} 