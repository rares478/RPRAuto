namespace RPRAuto.Server.Classes;

public interface ICar
{
    string Name { get; set; }
    string Description { get; set; }
    List<string> Pictures { get; set; }
}