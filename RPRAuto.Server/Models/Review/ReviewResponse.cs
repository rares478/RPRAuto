namespace RPRAuto.Server.Models.Review;

public class ReviewResponse
{
    public string ReviewId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ReviewerId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
} 