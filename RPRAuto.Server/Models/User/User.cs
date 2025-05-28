using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Models.User;

public class User : IUser
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("role")]
    public UserRole Role { get; set; }

    [BsonElement("companyCUI")]
    public string? CompanyCUI { get; set; }

    [BsonElement("listings")]
    public List<ObjectId> Listings { get; set; } = new();

    [BsonElement("bids")]
    public List<ObjectId> Bids { get; set; } = new();

    [BsonElement("review")]
    public ObjectId? Review { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("privateData")]
    public PrivateUserData PrivateData { get; set; } = new();

    [BsonElement("publicData")]
    public PublicUserData PublicData { get; set; } = new();

    // Helper properties to maintain compatibility
    [BsonIgnore]
    public string Email { 
        get => PrivateData.Login.Email; 
        set => PrivateData.Login.Email = value; 
    }

    [BsonIgnore]
    public string Password { 
        get => PrivateData.Login.Password; 
        set => PrivateData.Login.Password = value; 
    }

    public bool VerifyPassword(string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, PrivateData.Login.Password);
    }
}