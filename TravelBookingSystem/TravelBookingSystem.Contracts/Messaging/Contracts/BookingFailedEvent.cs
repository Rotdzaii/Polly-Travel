namespace TravelBookingSystem.Contracts.Messaging.Contracts;

public sealed class BookingFailedEvent : ISagaMessage
{
    public Guid BookingId { get; init; }
    public DateTime Timestamp { get; init; }
    public string Payload { get; init; } = string.Empty;
}
