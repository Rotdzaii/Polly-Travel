using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TravelBookingSystem.Coordinator.Abstractions;
using TravelBookingSystem.Coordinator.Data;
using TravelBookingSystem.Coordinator.Proxies;

namespace TravelBookingSystem.Coordinator.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBookingCoordinator(this IServiceCollection services, string connectionString, string mockServiceBaseUrl)
    {
        services.AddDbContext<TravelBookingDbContext>(options => options.UseSqlite(connectionString));

        services.AddHttpClient<IMedicalServiceProxy, MedicalServiceProxy>(client =>
        {
            client.BaseAddress = new Uri(mockServiceBaseUrl);
        });

        services.AddHttpClient<IHotelServiceProxy, HotelServiceProxy>(client =>
        {
            client.BaseAddress = new Uri(mockServiceBaseUrl);
        });

        services.AddHttpClient<IFlightServiceProxy, FlightServiceProxy>(client =>
        {
            client.BaseAddress = new Uri(mockServiceBaseUrl);
        });

        services.AddScoped<IBookingCoordinator, BookingCoordinator>();
        return services;
    }
}