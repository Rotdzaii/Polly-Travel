namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public interface IRabbitMqConsumer
{
    Task StartConsumingAsync(Func<string, Task> messageHandler, CancellationToken cancellationToken = default);
}
