using MongoDB.Bson;

namespace RPRAuto.Server.Classes;

interface IListing
{
    ObjectId Id { get; set; }
    ObjectId uId { get; set; }
    int Price { get; set; }
    ICar Car { get; set; }
}