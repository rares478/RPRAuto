namespace RPRAuto.Server.Classes;

interface ICar
{
    string name { get; set; }
    string description { get; set; }
    int price { get; set; }
    List<string> pictures { get; set; }
}