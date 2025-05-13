using MongoDB.Bson;

namespace RPRAuto.Server.Interfaces;

interface IListing
{
    ObjectId Id { get; set; }
    ObjectId uId { get; set; }
    string Title { get; set; }
    int Price { get; set; }
    ICar Car { get; set; }
    DateTime CreatedAt { get; set; }
    DateTime EndAt { get; set; }
}