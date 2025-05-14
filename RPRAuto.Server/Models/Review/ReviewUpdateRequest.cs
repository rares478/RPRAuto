namespace RPRAuto.Server.Models.Review;

public class ReviewUpdateRequest
{
    public string ReviewId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string ReviewText { get; set; } = string.Empty;
}