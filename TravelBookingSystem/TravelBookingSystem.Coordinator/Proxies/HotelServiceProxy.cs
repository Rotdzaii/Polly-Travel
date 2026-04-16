using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Coordinator.Proxies;

public sealed class HotelServiceProxy(HttpClient httpClient, ILogger<HotelServiceProxy> logger) : IHotelServiceProxy
{
    public async Task<bool> BookAsync(HotelBookingRequestDto request, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.PostAsJsonAsync("api/hotel/book", request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Hotel booking failed with status code {StatusCode}", response.StatusCode);
            return false;
        }

        var result = await response.Content.ReadFromJsonAsync<ServiceActionResponseDto>(cancellationToken: cancellationToken);
        return result?.Succeeded == true;
    }

    public async Task<bool> CancelAsync(Guid correlationId, CancellationToken cancellationToken = default)
    {
        var cancelRequest = new CancelBookingRequestDto { CorrelationId = correlationId, Reason = "Compensation" };
        var response = await httpClient.PostAsJsonAsync("api/hotel/cancel", cancelRequest, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}