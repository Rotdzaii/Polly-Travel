namespace TravelBookingSystem.Contracts.Messaging.Contracts;

public sealed class SagaMessageEnvelope
{
    public string MessageType { get; init; } = string.Empty;
    public string BodyJson { get; init; } = string.Empty;
}
