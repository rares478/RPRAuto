using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.Review;

public class ReviewRequest
{
    public string TransactionId { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public int Rating { get; set; }  // 1-5 stars
} 