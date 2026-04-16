using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TravelBookingSystem.Coordinator.Infrastructure.Messaging;

public static class ServiceCollectionMessagingExtensions
{
    public static IServiceCollection AddRabbitMqMessaging(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));
        services.AddSingleton<IRabbitMqConnectionFactory, RabbitMqConnectionFactory>();
        services.AddSingleton<IRabbitMqPublisher, RabbitMqPublisher>();
        services.AddSingleton<IRabbitMqConsumer, RabbitMqConsumer>();
        return services;
    }
}
