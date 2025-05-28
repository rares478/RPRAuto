using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;
using RPRAuto.Server.Models.Bid;

namespace RPRAuto.Server.Models
{
    public class SiteSettings
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonPropertyName("Id")]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }

        // Site Customization
        public string SiteTitle { get; set; } = "RPR Auto";
        public string HeroTitle { get; set; } = "Find Your Dream Car";
        public string HeroSubtitle { get; set; } = "Buy, sell, and bid on premium vehicles in our trusted marketplace";

        // Site Statistics
        public string ActiveUsers { get; set; } = "50K+";
        public string CarsSold { get; set; } = "15K+";
        public string LiveAuctions { get; set; } = "24/7";
        public string SatisfactionRate { get; set; } = "98%";

        // Site Management
        public bool MaintenanceMode { get; set; } = false;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

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
} 