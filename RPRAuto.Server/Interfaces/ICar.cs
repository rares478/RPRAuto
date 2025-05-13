namespace RPRAuto.Server.Interfaces;

public interface ICar
{
    string Make { get; set; }
    string Model { get; set; }
    int Year { get; set; }
    string Description { get; set; }
    bool IsManual { get; set; }
    string Color { get; set; }
    int Doors { get; set; }
    FuelType FuelType { get; set; }
    float EngineSize { get; set; }
    BodyType BodyType { get; set; }
    int HorsePower { get; set; }
    int Mileage { get; set; }
    List<string> Pictures { get; set; }
}

public enum FuelType
{
    Petrol,
    Diesel,
    Electric,
    Hybrid
}

public enum BodyType
{
    Sedan,
    Hatchback,
    SUV,
    Coupe,
    Convertible,
    Pickup,
    Van,
    Wagon,
}