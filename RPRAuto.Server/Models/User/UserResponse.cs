using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.User;

public class UserResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public PersonalData Personal { get; set; } = new();
    public UserRole Role { get; set; }
    public string? CompanyCUI { get; set; }
    public List<string> Listings { get; set; } = new();
    public List<string> Bids { get; set; } = new();
    public List<string> Reviews { get; set; } = new();
    public DateTime CreatedAt { get; set; }
} 