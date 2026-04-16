namespace TravelBookingSystem.Contracts.Messaging.Contracts;

public interface ISagaMessage
{
    Guid BookingId { get; init; }
    DateTime Timestamp { get; init; }
    string Payload { get; init; }
}
