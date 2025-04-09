namespace RPRAuto.Server.Classes;

interface IListing
{
    int id { get; set; }
    int uid { get; set; }
    int price { get; set; }
    ICar car { get; set; }
}