namespace RPRAuto.Server.Models.Review;

public class ReviewRequest
{
    public string UserId { get; set; } = string.Empty;
    public string ReviewerId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
} 