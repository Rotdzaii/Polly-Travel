namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public interface IRabbitMqPublisher
{
    Task PublishAsync<TMessage>(TMessage message, CancellationToken cancellationToken = default);
}
