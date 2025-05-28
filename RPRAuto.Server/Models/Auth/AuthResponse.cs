using RPRAuto.Server.Models.User;

namespace RPRAuto.Server.Models.Auth;

public class AuthResponse
{
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public LoginDetailsResponse? UserData { get; set; }
} 