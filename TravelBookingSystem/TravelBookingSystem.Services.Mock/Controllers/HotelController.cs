using Microsoft.AspNetCore.Mvc;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Services.Mock.Controllers;

[ApiController]
[Route("api/hotel")]
public sealed class HotelController(ILogger<HotelController> logger) : ControllerBase
{
    [HttpPost("book")]
    public async Task<ActionResult<ServiceActionResponseDto>> BookAsync([FromBody] HotelBookingRequestDto request)
    {
        logger.LogInformation("Hotel Receiving request for CorrelationId: {CorrelationId}", request.CorrelationId);
        await Task.Delay(TimeSpan.FromSeconds(2));

        logger.LogInformation("Hotel booking succeeded for customer {CustomerName}", request.CustomerName);

        return Ok(new ServiceActionResponseDto
        {
            Succeeded = true,
            Message = "Hotel booking succeeded."
        });
    }

    [HttpPost("cancel")]
    public async Task<ActionResult<ServiceActionResponseDto>> CancelAsync([FromBody] CancelBookingRequestDto request)
    {
        await Task.Delay(TimeSpan.FromSeconds(2));
        logger.LogInformation("Hotel booking cancelled for CorrelationId {CorrelationId}", request.CorrelationId);

        return Ok(new ServiceActionResponseDto
        {
            Succeeded = true,
            Message = "Hotel booking cancelled."
        });
    }
}