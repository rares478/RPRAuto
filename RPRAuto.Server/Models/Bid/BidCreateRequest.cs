using MongoDB.Bson;
using RPRAuto.Server.Interfaces;

namespace RPRAuto.Server.Models.Bid;

public class BidCreateRequest
{
    public ObjectId UserId { get; set; }
    public string Title { get; set; }
    public int TopBid { get; set; }
    public int MinBid { get; set; }
    public int InstantBuy { get; set; }
    public ICar Car { get; set; }
    public DateTime EndAt { get; set; }
}