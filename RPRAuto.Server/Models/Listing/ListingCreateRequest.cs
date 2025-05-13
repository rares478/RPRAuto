using MongoDB.Bson;
using RPRAuto.Server.Models.Car;

namespace RPRAuto.Server.Models.Listing;

public class ListingCreateRequest
{
    public ObjectId UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public Enums.ListingStatus Status { get; set; } = Enums.ListingStatus.Active;
    public decimal Price { get; set; }
    public string Title { get; set; } = string.Empty;
    public Car.Car Car { get; set; } = new Car.Car();
    public DateTime EndAt { get; set; }
} 