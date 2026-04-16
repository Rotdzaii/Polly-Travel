using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Coordinator.Proxies;

public sealed class FlightServiceProxy(HttpClient httpClient, ILogger<FlightServiceProxy> logger) : IFlightServiceProxy
{
    public async Task<bool> BookAsync(FlightBookingRequestDto request, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.PostAsJsonAsync("api/spaceflight/book", request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Flight booking failed with status code {StatusCode}", response.StatusCode);
            return false;
        }

        var result = await response.Content.ReadFromJsonAsync<ServiceActionResponseDto>(cancellationToken: cancellationToken);
        return result?.Succeeded == true;
    }

    public async Task<bool> CancelAsync(Guid correlationId, CancellationToken cancellationToken = default)
    {
        var cancelRequest = new CancelBookingRequestDto { CorrelationId = correlationId, Reason = "Compensation" };
        var response = await httpClient.PostAsJsonAsync("api/spaceflight/cancel", cancelRequest, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}