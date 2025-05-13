using System.Runtime.InteropServices.JavaScript;
using RPRAuto.Server.Interfaces;

namespace RPRAuto.Server.Classes;

public class Car : ICar
{
    public string Make { get; set; }
    public string Model { get; set; }
    public JSType.Date Year { get; set; }
    public string Description { get; set; }
    public bool IsManual { get; set; }
    public string Color { get; set; }
    public int Doors { get; set; }
    public FuelType FuelType { get; set; }
    public float EngineSize { get; set; }
    public BodyType BodyType { get; set; }
    public int HorsePower { get; set; }
    public int Mileage { get; set; }
    public List<string> Pictures { get; set; }
}