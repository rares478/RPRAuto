namespace RPRAuto.Server.Models.User;

public class UserUpdateRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? CompanyCUI { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
} 