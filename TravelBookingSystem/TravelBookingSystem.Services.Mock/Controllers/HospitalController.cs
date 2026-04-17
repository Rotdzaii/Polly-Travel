using Microsoft.AspNetCore.Mvc;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Services.Mock.Controllers;

[ApiController]
[Route("api/hospital")]
public sealed class HospitalController(ILogger<HospitalController> logger) : ControllerBase
{
    [HttpPost("book")]
    public async Task<ActionResult<ServiceActionResponseDto>> BookAsync([FromBody] MedicalBookingRequestDto request)
    {
        logger.LogInformation("[Hospital] Receiving request for CorrelationId: {CorrelationId}", request.CorrelationId);
        await Task.Delay(TimeSpan.FromSeconds(2));

        logger.LogInformation("Hospital booking succeeded for customer {CustomerName}", request.CustomerName);

        return Ok(new ServiceActionResponseDto
        {
            Succeeded = true,
            Message = "Hospital booking succeeded."
        });
    }

    [HttpPost("cancel")]
    public async Task<ActionResult<ServiceActionResponseDto>> CancelAsync([FromBody] CancelBookingRequestDto request)
    {
        await Task.Delay(TimeSpan.FromSeconds(2));
        logger.LogInformation("Hospital booking cancelled for CorrelationId {CorrelationId}", request.CorrelationId);

        return Ok(new ServiceActionResponseDto
        {
            Succeeded = true,
            Message = "Hospital booking cancelled."
        });
    }
}