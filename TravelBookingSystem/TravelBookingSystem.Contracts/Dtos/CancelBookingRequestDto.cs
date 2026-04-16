namespace TravelBookingSystem.Contracts.Dtos;

public sealed class CancelBookingRequestDto
{
    public Guid CorrelationId { get; init; }
    public string Reason { get; init; } = "Compensation";
}