using Microsoft.AspNetCore.Mvc;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Services.Mock.Controllers;

[ApiController]
[Route("api/spaceflight")]
public sealed class SpaceFlightController(ILogger<SpaceFlightController> logger) : ControllerBase
{
    private const string WeatherCancellationReason = "Hủy chuyến do thời tiết xấu.";
    private static int BookingAttemptCounter;

    [HttpPost("book")]
    public async Task<ActionResult<ServiceActionResponseDto>> BookAsync([FromBody] FlightBookingRequestDto request)
    {
        logger.LogInformation("[SpaceFlight] Receiving request for CorrelationId: {CorrelationId}", request.CorrelationId);
        await Task.Delay(TimeSpan.FromSeconds(2));

        var currentAttempt = System.Threading.Interlocked.Increment(ref BookingAttemptCounter);
        var shouldCancelForWeather = currentAttempt % 3 == 0;

        logger.LogInformation("[SpaceFlight] Attempt={Attempt} Outcome={Outcome} CorrelationId={CorrelationId}",
            currentAttempt,
            shouldCancelForWeather ? "CancelledByWeather" : "Success",
            request.CorrelationId);

        if (shouldCancelForWeather)
        {
            logger.LogWarning("SpaceFlight booking cancelled due to weather for customer {CustomerName}. Attempt={Attempt}", request.CustomerName, currentAttempt);
            return StatusCode(StatusCodes.Status500InternalServerError, new ServiceActionResponseDto
            {
                Succeeded = false,
                Message = WeatherCancellationReason
            });
        }

        return Ok(new ServiceActionResponseDto
        {
            Succeeded = true,
            Message = "SpaceFlight booking succeeded."
        });
    }

    [HttpPost("cancel")]
    public async Task<ActionResult<ServiceActionResponseDto>> CancelAsync([FromBody] CancelBookingRequestDto request)
    {
        await Task.Delay(TimeSpan.FromSeconds(2));
        logger.LogInformation("SpaceFlight booking cancelled for CorrelationId {CorrelationId}", request.CorrelationId);

        return Ok(new ServiceActionResponseDto
        {
            Succeeded = true,
            Message = "SpaceFlight booking cancelled."
        });
    }
}