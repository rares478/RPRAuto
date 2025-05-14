
namespace RPRAuto.Server.Models.Listing;

public class ListingUpdateRequest
{
    public Car.Car Car { get; set; } = new();
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}