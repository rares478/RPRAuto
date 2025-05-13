using MongoDB.Bson;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Interfaces;

interface IBid
{ 
 ObjectId Id { get; set; }
 ObjectId UserId { get; set; } 
 string Title { get; set; }
 decimal TopBid { get; set; }
 BidStatus Status { get; set; }
 decimal MinBid { get; set; }
 string Description { get; set; }
 Dictionary<ObjectId, decimal> Bids { get; set; }
 decimal InstantBuy { get; set; }
 ICar Car { get; set; }
 DateTime CreatedAt { get; set; }
 DateTime EndAt { get; set; }
}