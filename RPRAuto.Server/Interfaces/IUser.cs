using MongoDB.Bson;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Interfaces;

public interface IUser
{
    ObjectId UserId { get; set; }
    LoginDetails Login { get; set; }
    PersonalData Personal { get; set; }
    UserRole Role { get; set; }
    string? CompanyCUI { get; set; }
    List<ObjectId> Listings { get; set; }
    List<ObjectId> Bids { get; set; }
    ObjectId? Review { get; set; }

    bool VerifyPassword(string password);
}

public class PersonalData
{
    public string FirstName { get; set; } // Will be Company Name for companies
    public string? LastName { get; set; } // Will be empty for companies
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
}

public class LoginDetails
{
    public string Email { get; set; }
    public string Password { get; set; }
}