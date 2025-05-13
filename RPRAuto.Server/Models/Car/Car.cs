using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.Car;

public class Car : ICar
{
    [BsonElement("make")]
    public string Make { get; set; } = string.Empty;

    [BsonElement("model")]
    public string Model { get; set; } = string.Empty;

    [BsonElement("year")]
    public int Year { get; set; }

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("gearboxType")]
    public GearboxType GearboxType { get; set; }

    [BsonElement("color")]
    public string Color { get; set; } = string.Empty;

    [BsonElement("doors")]
    public int Doors { get; set; }

    [BsonElement("fuelType")]
    public FuelType FuelType { get; set; }

    [BsonElement("engineSize")]
    public float EngineSize { get; set; }

    [BsonElement("bodyType")]
    public BodyType BodyType { get; set; }

    [BsonElement("horsePower")]
    public int HorsePower { get; set; }

    [BsonElement("mileage")]
    public int Mileage { get; set; }

    [BsonElement("pictures")]
    public List<string> Pictures { get; set; } = new();
} 