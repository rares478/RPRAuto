using MongoDB.Bson;
using System.Text.Json.Serialization;
using RPRAuto.Server.Models.Car;

namespace RPRAuto.Server.Models.Bid;

public class BidCreateRequest
{
    [JsonPropertyName("UserId")]
    public ObjectId UserId { get; set; }

    [JsonPropertyName("Title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("TopBid")]
    public int TopBid { get; set; } = 0;

    [JsonPropertyName("MinBid")]
    public int MinBid { get; set; }

    [JsonPropertyName("InstantBuy")]
    public int InstantBuy { get; set; }

    [JsonPropertyName("Car")]
    public Car.Car Car { get; set; } = new Car.Car();

    [JsonPropertyName("EndAt")]
    public DateTime EndAt { get; set; }
}