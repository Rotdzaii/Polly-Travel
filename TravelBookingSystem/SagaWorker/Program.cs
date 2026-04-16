using SagaWorker;
using TravelBookingSystem.Coordinator.Data;
using TravelBookingSystem.Coordinator.DependencyInjection;
using TravelBookingSystem.Coordinator.Infrastructure.Messaging;

var builder = Host.CreateApplicationBuilder(args);

var dbPathOverride = Environment.GetEnvironmentVariable("TRAVEL_BOOKING_DB_PATH");
var connectionString = !string.IsNullOrWhiteSpace(dbPathOverride)
	? $"Data Source={dbPathOverride}"
	: builder.Configuration.GetConnectionString("BookingDb") ?? "Data Source=travel-booking-sm.db";
var mockServicesBaseUrl = builder.Configuration["MockServices:ApiBaseUrl"]
	?? "http://localhost:5092/";

builder.Services.AddBookingCoordinator(connectionString, mockServicesBaseUrl);
builder.Services.AddRabbitMqMessaging(builder.Configuration);
builder.Services.AddHostedService<Worker>();

var host = builder.Build();

using (var scope = host.Services.CreateScope())
{
	var dbContext = scope.ServiceProvider.GetRequiredService<TravelBookingDbContext>();
	await dbContext.Database.EnsureCreatedAsync();
}

host.Run();
