using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RPRAuto.Server.Classes;

public class User : IUser
{
    [BsonId]
    public ObjectId UserId { get; set; }
    public LoginDetails Login { get; set; } = new LoginDetails();
    public PersonalData Personal { get; set; } = new PersonalData();
    public Role Role { get; set; }
    public string? CompanyCUI { get; set; }
    
    [BsonElement("listings")]
    public List<ObjectId> Listings { get; set; } = new List<ObjectId>();
    
    [BsonElement("bids")]
    public List<ObjectId> Bids { get; set; } = new List<ObjectId>();
    
    [BsonElement("reviews")]
    public Dictionary<ObjectId, string> Reviews { get; set; } = new Dictionary<ObjectId, string>();

    // Helper properties to maintain compatibility
    [BsonIgnore]
    public string Email { 
        get => Login.Email; 
        set => Login.Email = value; 
    }

    [BsonIgnore]
    public string Password { 
        get => Login.Password; 
        set => Login.Password = value; 
    }

    public bool VerifyPassword(string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, Login.Password);
    }
}

public class Login
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class Register
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string PhoneNumber { get; set; }
    public bool IsCompany { get; set; }
    public string? CompanyCUI { get; set; } // Only required if IsCompany is true
}

public class UserUpdateRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
}

public class LoginDetailsResponse
{
    public LoginDetails Login { get; set; }
}

public class PersonalDetailsResponse
{
    public PersonalData Personal { get; set; }
}