using RabbitMQ.Client;

namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public interface IRabbitMqConnectionFactory : IDisposable
{
    IConnection GetConnection();
}
