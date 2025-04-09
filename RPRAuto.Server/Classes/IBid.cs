namespace RPRAuto.Server.Classes;

interface IBid
{ 
 int id { get; set; }
 int uid { get; set; }
 int top_bid { get; set; }
 int min_bid { get; set; }
 Dictionary<int, int> bids { get; set; }
 int instantBuy { get; set; }
 ICar car { get; set; }
}