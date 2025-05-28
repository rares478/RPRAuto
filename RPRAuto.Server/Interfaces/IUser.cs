using MongoDB.Bson;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Interfaces;

public interface IUser
{
    ObjectId Id { get; set; }
    UserRole Role { get; set; }
    string? CompanyCUI { get; set; }
    List<ObjectId> Listings { get; set; }
    List<ObjectId> Bids { get; set; }
    ObjectId? Review { get; set; }
    DateTime CreatedAt { get; set; }
    DateTime UpdatedAt { get; set; }

    // Private data - only accessible by the user themselves
    PrivateUserData PrivateData { get; set; }
    
    // Public data - accessible by other users
    PublicUserData PublicData { get; set; }

    bool VerifyPassword(string password);
}

public class PrivateUserData
{
    public LoginDetails Login { get; set; } = new();
    public PersonalData Personal { get; set; } = new();
}

public class PublicUserData
{
    public string DisplayName { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int TotalSales { get; set; }
    public DateTime MemberSince { get; set; }
    public bool IsVerified { get; set; }
}

public class PersonalData
{
    public string FirstName { get; set; } // Will be Company Name for companies
    public string? LastName { get; set; } // Will be empty for companies
    public string Address { get; set; }
}

public class LoginDetails
{
    public string Email { get; set; }
    public string Password { get; set; }
}