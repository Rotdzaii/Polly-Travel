using Microsoft.AspNetCore.Mvc;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Services.Mock.Controllers;

[ApiController]
[Route("api/spaceflight")]
public sealed class SpaceFlightController(ILogger<SpaceFlightController> logger) : ControllerBase
{
    [HttpPost("book")]
    public async Task<ActionResult<ServiceActionResponseDto>> BookAsync([FromBody] FlightBookingRequestDto request)
    {
        logger.LogInformation("[SpaceFlight] Receiving request for CorrelationId: {CorrelationId}", request.CorrelationId);
        await Task.Delay(TimeSpan.FromSeconds(2));

        var failed = Random.Shared.NextDouble() < 0.2;
        if (failed)
        {
            logger.LogWarning("SpaceFlight booking failed for customer {CustomerName}", request.CustomerName);
            return StatusCode(StatusCodes.Status500InternalServerError, new ServiceActionResponseDto
            {
                Succeeded = false,
                Message = "SpaceFlight booking failed."
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