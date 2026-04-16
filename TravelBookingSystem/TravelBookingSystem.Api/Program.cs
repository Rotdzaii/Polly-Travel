using Microsoft.EntityFrameworkCore;
using TravelBookingSystem.Coordinator.Infrastructure.Messaging;
using TravelBookingSystem.Coordinator.Data;
using TravelBookingSystem.Coordinator.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("PollyUi", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .AllowAnyHeader();
    });
});

var dbPathOverride = Environment.GetEnvironmentVariable("TRAVEL_BOOKING_DB_PATH");
var connectionString = !string.IsNullOrWhiteSpace(dbPathOverride)
    ? $"Data Source={dbPathOverride}"
    : builder.Configuration.GetConnectionString("BookingDb") ?? "Data Source=travel-booking-sm.db";
var mockServicesBaseUrl = builder.Configuration["MockServices:ApiBaseUrl"]
    ?? "http://localhost:5092/";

builder.Services.AddBookingCoordinator(connectionString, mockServicesBaseUrl);
builder.Services.AddRabbitMqMessaging(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<TravelBookingDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("PollyUi");
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.MapControllers();

app.Run();
