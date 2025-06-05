using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.Review;

public class ReviewCreateRequest
{
    public string SellerId { get; set; }
    public string TransactionId { get; set; }
    public TransactionType TransactionType { get; set; }
    public int Rating { get; set; }
} 