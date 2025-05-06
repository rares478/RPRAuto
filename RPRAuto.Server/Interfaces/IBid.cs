using MongoDB.Bson;

namespace RPRAuto.Server.Classes;

interface IBid
{ 
 ObjectId Id { get; set; }
 ObjectId uId { get; set; }
 int TopBid { get; set; }
 int MinBid { get; set; }
 Dictionary<ObjectId, int> Bids { get; set; }
 int InstantBuy { get; set; }
 ICar Car { get; set; }
 DateTime CreatedAt { get; set; }
 DateTime EndAt { get; set; }
}