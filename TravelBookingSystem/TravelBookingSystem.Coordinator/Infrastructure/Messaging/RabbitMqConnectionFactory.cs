using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public sealed class RabbitMqConnectionFactory : IRabbitMqConnectionFactory
{
    private readonly IConnection _connection;

    public RabbitMqConnectionFactory(IOptions<RabbitMqOptions> options)
    {
        var settings = options.Value;
        var factory = new ConnectionFactory
        {
            HostName = settings.HostName,
            Port = settings.Port,
            UserName = settings.UserName,
            Password = settings.Password,
            DispatchConsumersAsync = true,
            AutomaticRecoveryEnabled = true
        };

        _connection = factory.CreateConnection();
    }

    public IConnection GetConnection() => _connection;

    public void Dispose()
    {
        if (_connection.IsOpen)
        {
            _connection.Close();
        }

        _connection.Dispose();
    }
}
