using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RPRAuto.Server.Classes;

public class Bid : IBid
{
    [BsonId]
    public ObjectId Id { get; set; }
    public ObjectId uId { get; set; }
    public int TopBid { get; set; }
    public int MinBid { get; set; }
    public Dictionary<ObjectId, int> Bids { get; set; }
    public int InstantBuy { get; set; }
    public ICar Car { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime EndAt { get; set; }
}

public class BidUpdateRequest
{
    public int MinBid { get; set; }
    public int InstantBuy { get; set; }
}

public class PlaceBidRequest
{
    public string UserId { get; set; }
    public int Amount { get; set; }
}

public class BidCreateRequest
{
    public ObjectId UserId { get; set; }
    public int TopBid { get; set; }
    public int MinBid { get; set; }
    public int InstantBuy { get; set; }
    public ICar Car { get; set; }
    public DateTime EndAt { get; set; }
}