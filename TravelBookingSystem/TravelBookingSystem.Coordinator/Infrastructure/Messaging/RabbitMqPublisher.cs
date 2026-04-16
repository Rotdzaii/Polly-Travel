using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using TravelBookingSystem.Contracts.Messaging.Contracts;

namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public sealed class RabbitMqPublisher(
    IRabbitMqConnectionFactory connectionFactory,
    IOptions<RabbitMqOptions> options,
    ILogger<RabbitMqPublisher> logger) : IRabbitMqPublisher
{
    public Task PublishAsync<TMessage>(TMessage message, CancellationToken cancellationToken = default)
    {
        var queueName = options.Value.QueueName;
        using var channel = connectionFactory.GetConnection().CreateModel();
        channel.QueueDeclare(queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);

        var envelope = new SagaMessageEnvelope
        {
            MessageType = typeof(TMessage).Name,
            BodyJson = JsonSerializer.Serialize(message)
        };

        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(envelope));
        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;

        channel.BasicPublish(exchange: string.Empty, routingKey: queueName, basicProperties: properties, body: body);
        logger.LogInformation("[RABBITMQ PUBLISH] Type={MessageType} Queue={QueueName}", envelope.MessageType, queueName);

        return Task.CompletedTask;
    }
}
