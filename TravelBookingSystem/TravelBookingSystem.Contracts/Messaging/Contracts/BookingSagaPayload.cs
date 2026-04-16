namespace TravelBookingSystem.Contracts.Messaging.Contracts;

public sealed class BookingSagaPayload
{
    public string CustomerName { get; init; } = string.Empty;
    public string MedicalPackageCode { get; init; } = "MED-STANDARD";
    public string HotelCode { get; init; } = "LUNAR-HOTEL-A";
    public int Nights { get; init; } = 3;
    public string FlightCode { get; init; } = "FLIGHT-001";
    public string SeatClass { get; init; } = "Economy";
}
