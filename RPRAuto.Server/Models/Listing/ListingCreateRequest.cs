using MongoDB.Bson;
using RPRAuto.Server.Models.Car;
using System.Text.Json.Serialization;

namespace RPRAuto.Server.Models.Listing;

public class ListingCreateRequest
{
    [JsonPropertyName("UserId")]
    public ObjectId UserId { get; set; }

    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("Status")]
    public Enums.ListingStatus Status { get; set; } = Enums.ListingStatus.Active;

    [JsonPropertyName("Price")]
    public decimal Price { get; set; }

    [JsonPropertyName("Title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("Car")]
    public Car.Car Car { get; set; } = new Car.Car();

    [JsonPropertyName("EndAt")]
    public DateTime EndAt { get; set; }
}