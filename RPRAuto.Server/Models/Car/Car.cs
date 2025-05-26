using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace RPRAuto.Server.Models.Car;

[JsonConverter(typeof(CarConverter))]
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

public class CarConverter : JsonConverter<Car>
{
    public override Car Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartObject)
        {
            throw new JsonException();
        }

        var car = new Car();
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
            {
                break;
            }

            if (reader.TokenType != JsonTokenType.PropertyName)
            {
                throw new JsonException();
            }

            var propertyName = reader.GetString();
            reader.Read();

            switch (propertyName)
            {
                case "Make":
                    car.Make = reader.GetString() ?? string.Empty;
                    break;
                case "Model":
                    car.Model = reader.GetString() ?? string.Empty;
                    break;
                case "Year":
                    car.Year = reader.GetInt32();
                    break;
                case "Mileage":
                    car.Mileage = reader.GetInt32();
                    break;
                case "Color":
                    car.Color = reader.GetString() ?? string.Empty;
                    break;
                case "GearboxType":
                    car.GearboxType = Enum.Parse<GearboxType>(reader.GetString() ?? "Any");
                    break;
                case "FuelType":
                    car.FuelType = Enum.Parse<FuelType>(reader.GetString() ?? "Petrol");
                    break;
                case "BodyType":
                    car.BodyType = Enum.Parse<BodyType>(reader.GetString() ?? "Any");
                    break;
                case "EngineSize":
                    car.EngineSize = reader.GetSingle();
                    break;
                case "HorsePower":
                    car.HorsePower = reader.GetInt32();
                    break;
                case "Pictures":
                    car.Pictures = JsonSerializer.Deserialize<List<string>>(ref reader, options) ?? new List<string>();
                    break;
                default:
                    reader.Skip();
                    break;
            }
        }

        return car;
    }

    public override void Write(Utf8JsonWriter writer, Car value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString("Make", value.Make);
        writer.WriteString("Model", value.Model);
        writer.WriteNumber("Year", value.Year);
        writer.WriteNumber("Mileage", value.Mileage);
        writer.WriteString("Color", value.Color);
        writer.WriteString("GearboxType", value.GearboxType.ToString());
        writer.WriteString("FuelType", value.FuelType.ToString());
        writer.WriteString("BodyType", value.BodyType.ToString());
        writer.WriteNumber("EngineSize", value.EngineSize);
        writer.WriteNumber("HorsePower", value.HorsePower);
        writer.WritePropertyName("Pictures");
        JsonSerializer.Serialize(writer, value.Pictures, options);
        writer.WriteEndObject();
    }
} 