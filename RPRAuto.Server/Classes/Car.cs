namespace RPRAuto.Server.Classes;

public class Car : ICar
{
    public string Name { get; set; }
    public string Description { get; set; }
    public List<string> Pictures { get; set; }
    
}