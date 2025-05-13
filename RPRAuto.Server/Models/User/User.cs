using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.User;

public class User : IUser
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId UserId { get; set; }

    [BsonElement("login")]
    public LoginDetails Login { get; set; } = new();

    [BsonElement("personal")]
    public PersonalData Personal { get; set; } = new();

    [BsonElement("role")]
    public UserRole Role { get; set; }

    [BsonElement("companyCUI")]
    public string? CompanyCUI { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("listings")]
    public List<ObjectId> Listings { get; set; } = new();

    [BsonElement("bids")]
    public List<ObjectId> Bids { get; set; } = new();

    [BsonElement("reviews")]
    public ObjectId? Review { get; set; }

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