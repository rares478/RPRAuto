using MongoDB.Bson;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Interfaces;

interface IListing
{
    ObjectId Id { get; set; }
    ObjectId UserId { get; set; }
    string Title { get; set; }
    decimal Price { get; set; }
    ICar Car { get; set; }
    DateTime CreatedAt { get; set; }
    ListingStatus Status { get; set; }
    string Description { get; set; }
}