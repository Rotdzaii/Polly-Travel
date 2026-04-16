using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Coordinator.Proxies;

public sealed class MedicalServiceProxy(HttpClient httpClient, ILogger<MedicalServiceProxy> logger) : IMedicalServiceProxy
{
    public async Task<bool> BookAsync(MedicalBookingRequestDto request, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.PostAsJsonAsync("api/hospital/book", request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Medical booking failed with status code {StatusCode}", response.StatusCode);
            return false;
        }

        var result = await response.Content.ReadFromJsonAsync<ServiceActionResponseDto>(cancellationToken: cancellationToken);
        return result?.Succeeded == true;
    }

    public async Task<bool> CancelAsync(Guid correlationId, CancellationToken cancellationToken = default)
    {
        var cancelRequest = new CancelBookingRequestDto { CorrelationId = correlationId, Reason = "Compensation" };
        var response = await httpClient.PostAsJsonAsync("api/hospital/cancel", cancelRequest, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}