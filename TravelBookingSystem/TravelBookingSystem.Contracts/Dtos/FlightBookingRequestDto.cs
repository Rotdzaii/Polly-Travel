namespace TravelBookingSystem.Contracts.Dtos;

public sealed class FlightBookingRequestDto
{
    public string CorrelationId { get; set; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string FlightCode { get; init; } = "FLIGHT-001";
    public string SeatClass { get; init; } = "Economy";
}