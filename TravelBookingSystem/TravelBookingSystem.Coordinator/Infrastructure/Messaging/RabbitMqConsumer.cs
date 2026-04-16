using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public sealed class RabbitMqConsumer(
    IRabbitMqConnectionFactory connectionFactory,
    IOptions<RabbitMqOptions> options,
    ILogger<RabbitMqConsumer> logger) : IRabbitMqConsumer
{
    public Task StartConsumingAsync(Func<string, Task> messageHandler, CancellationToken cancellationToken = default)
    {
        var queueName = options.Value.QueueName;
        var channel = connectionFactory.GetConnection().CreateModel();
        channel.QueueDeclare(queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.Received += async (_, args) =>
        {
            var json = Encoding.UTF8.GetString(args.Body.ToArray());
            try
            {
                await messageHandler(json);
                channel.BasicAck(args.DeliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[RABBITMQ CONSUME ERROR] Failed to process message from queue {Queue}", queueName);
                channel.BasicNack(args.DeliveryTag, multiple: false, requeue: true);
            }
        };

        channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
        logger.LogInformation("[RABBITMQ CONSUMER] Listening on queue {QueueName}", queueName);

        cancellationToken.Register(() =>
        {
            if (channel.IsOpen)
            {
                channel.Close();
            }

            channel.Dispose();
        });

        return Task.CompletedTask;
    }
}
