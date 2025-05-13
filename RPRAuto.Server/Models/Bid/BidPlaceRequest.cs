namespace RPRAuto.Server.Models.Bid;

public class BidPlaceRequest
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
} 