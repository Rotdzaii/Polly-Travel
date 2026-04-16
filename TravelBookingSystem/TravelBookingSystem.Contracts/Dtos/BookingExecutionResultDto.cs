using TravelBookingSystem.Contracts.Enums;

namespace TravelBookingSystem.Contracts.Dtos;

public sealed class BookingExecutionResultDto
{
    public Guid CorrelationId { get; init; }
    public BookingStatus Status { get; init; }
    public bool Succeeded { get; init; }
    public string Message { get; init; } = string.Empty;
}