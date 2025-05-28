namespace RPRAuto.Server.Models.User;

public class UserUpdateRequest
{
    // Personal data updates
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    
    // Public data updates
    public string DisplayName { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    
    // Company data
    public string? CompanyCUI { get; set; }
    
    // Password update
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
} 