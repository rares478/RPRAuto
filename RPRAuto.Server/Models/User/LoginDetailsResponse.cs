namespace RPRAuto.Server.Models.User;

public class LoginDetailsResponse
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
} 