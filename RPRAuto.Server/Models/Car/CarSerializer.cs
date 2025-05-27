using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.Car;

public class CarSerializer : SerializerBase<ICar>
{
    public override ICar Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var type = context.Reader.GetCurrentBsonType();
        if (type == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        var doc = BsonDocumentSerializer.Instance.Deserialize(context, args);
        var car = new Car
        {
            Make = doc["make"].AsString,
            Model = doc["model"].AsString,
            Year = doc["year"].AsInt32,
            Mileage = doc["mileage"].AsInt32,
            Color = doc["color"].AsString,
            GearboxType = (GearboxType)Enum.Parse(typeof(GearboxType), doc["gearboxType"].AsString),
            FuelType = (FuelType)Enum.Parse(typeof(FuelType), doc["fuelType"].AsString),
            BodyType = (BodyType)Enum.Parse(typeof(BodyType), doc["bodyType"].AsString),
            EngineSize = (float)doc["engineSize"].AsDouble,
            HorsePower = doc["horsePower"].AsInt32,
            Pictures = doc["pictures"].AsBsonArray.Select(x => x.AsString).ToList()
        };

        return car;
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, ICar value)
    {
        if (value == null)
        {
            context.Writer.WriteNull();
            return;
        }

        var doc = new BsonDocument
        {
            ["make"] = value.Make,
            ["model"] = value.Model,
            ["year"] = value.Year,
            ["mileage"] = value.Mileage,
            ["color"] = value.Color,
            ["gearboxType"] = value.GearboxType.ToString(),
            ["fuelType"] = value.FuelType.ToString(),
            ["bodyType"] = value.BodyType.ToString(),
            ["engineSize"] = value.EngineSize,
            ["horsePower"] = value.HorsePower,
            ["pictures"] = new BsonArray(value.Pictures)
        };

        BsonDocumentSerializer.Instance.Serialize(context, args, doc);
    }
} 