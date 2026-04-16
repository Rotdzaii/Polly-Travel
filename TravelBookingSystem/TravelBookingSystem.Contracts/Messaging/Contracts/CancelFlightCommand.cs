namespace TravelBookingSystem.Contracts.Messaging.Contracts;

public sealed class CancelFlightCommand : ISagaMessage
{
    public Guid BookingId { get; init; }
    public DateTime Timestamp { get; init; }
    public string Payload { get; init; } = string.Empty;
}
