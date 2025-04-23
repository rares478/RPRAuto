using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RPRAuto.Server.Classes;

public class Listing : IListing
{
    [BsonId]
    public ObjectId Id { get; set; }
    public ObjectId uId { get; set; }
    public int Price { get; set; } 
    public ICar Car { get; set; }
}

public class ListingUpdateRequest
{
    public int Price { get; set; }
    public ICar Car { get; set; }
}

public class ListingDeleteRequest
{
    public string Id { get; set; }
}
public class ListingCreateRequest
{
    public ObjectId UserId { get; set; }
    public int Price { get; set; }
    public ICar Car { get; set; }
}

public class ListingPurchaseRequest
{
    public string UserId { get; set; }
    public string ListingId { get; set; }
}