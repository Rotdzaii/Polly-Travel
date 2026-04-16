using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using TravelBookingSystem.Contracts.Dtos;
using TravelBookingSystem.Contracts.Enums;
using TravelBookingSystem.Contracts.Messaging.Contracts;
using TravelBookingSystem.Coordinator.Abstractions;
using TravelBookingSystem.Coordinator.Data;
using TravelBookingSystem.Coordinator.Infrastructure.Messaging;

namespace TravelBookingSystem.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public sealed class BookingController(
    IBookingCoordinator bookingCoordinator,
    IRabbitMqPublisher rabbitMqPublisher,
    TravelBookingDbContext dbContext,
    ILogger<BookingController> logger) : ControllerBase
{
    [HttpPost]
    [HttpPost("/api/applications")]
    [HttpPost("/booking")]
    public async Task<ActionResult<BookingExecutionResultDto>> CreateBookingAsync(
        [FromBody] CreateBookingRequest request,
        CancellationToken cancellationToken)
    {
        var bookingId = Guid.NewGuid();
        var payload = new BookingSagaPayload
        {
            CustomerName = request.CustomerName,
            MedicalPackageCode = request.MedicalPackageCode,
            HotelCode = request.HotelCode,
            Nights = request.Nights,
            FlightCode = request.FlightCode,
            SeatClass = request.SeatClass
        };

        dbContext.BookingRecords.Add(new BookingRecord
        {
            CorrelationId = bookingId,
            CustomerName = request.CustomerName,
            Status = BookingStatus.Initial,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync(cancellationToken);

        var message = new BookingRequestedMessage
        {
            BookingId = bookingId,
            Timestamp = DateTime.UtcNow,
            Payload = JsonSerializer.Serialize(payload)
        };

        await rabbitMqPublisher.PublishAsync(message, cancellationToken);
        logger.LogInformation("Booking request accepted and queued. BookingId={BookingId}", bookingId);

        return Accepted(new
        {
            bookingId,
            correlationId = bookingId,
            status = BookingStatus.Initial.ToString()
        });
    }

    [HttpGet("{correlationId}")]
    [HttpGet("/booking-status/{correlationId}")]
    public async Task<ActionResult<BookingStatusResponseDto>> GetBookingStatusAsync(
        [FromRoute] string correlationId,
        CancellationToken cancellationToken)
    {
        var status = await bookingCoordinator.GetBookingStatusAsync(correlationId, cancellationToken);
        if (status is null)
        {
            return NotFound();
        }

        return Ok(status);
    }
}

public sealed class CreateBookingRequest
{
    public string CustomerName { get; init; } = string.Empty;
    public string MedicalPackageCode { get; init; } = "MED-STANDARD";
    public string HotelCode { get; init; } = "LUNAR-HOTEL-A";
    public int Nights { get; init; } = 3;
    public string FlightCode { get; init; } = "FLIGHT-001";
    public string SeatClass { get; init; } = "Economy";
}