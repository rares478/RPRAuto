namespace RPRAuto.Server.Interfaces;

public interface ICar
{
    string Make { get; set; }
    string Model { get; set; }
    int Year { get; set; }
    string Description { get; set; }
    Models.Enums.GearboxType GearboxType { get; set; }
    string Color { get; set; }
    int Doors { get; set; }
    Models.Enums.FuelType FuelType { get; set; }
    float EngineSize { get; set; }
    Models.Enums.BodyType BodyType { get; set; }
    int HorsePower { get; set; }
    int Mileage { get; set; }
    List<string> Pictures { get; set; }
}