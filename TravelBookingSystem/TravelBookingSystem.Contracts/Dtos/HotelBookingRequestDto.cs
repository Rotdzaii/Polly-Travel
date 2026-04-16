namespace TravelBookingSystem.Contracts.Dtos;

public sealed class HotelBookingRequestDto
{
    public string CorrelationId { get; set; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string HotelCode { get; init; } = "LUNAR-HOTEL-A";
    public int Nights { get; init; } = 3;
}