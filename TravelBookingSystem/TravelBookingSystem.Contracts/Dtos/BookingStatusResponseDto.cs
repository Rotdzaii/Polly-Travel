namespace TravelBookingSystem.Contracts.Dtos;

public sealed class BookingStatusResponseDto
{
    public string CorrelationId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime LastUpdated { get; init; }
}