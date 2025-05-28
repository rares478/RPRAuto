using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.User;

public class UserResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? CompanyCUI { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Private data - only included when the requesting user is the owner
    public PrivateUserData? PrivateData { get; set; }
    
    // Public data
    public PublicUserData PublicData { get; set; } = new();
    
    // References
    public List<string> Listings { get; set; } = new();
    public List<string> Bids { get; set; } = new();
    public string? ReviewId { get; set; }
} 