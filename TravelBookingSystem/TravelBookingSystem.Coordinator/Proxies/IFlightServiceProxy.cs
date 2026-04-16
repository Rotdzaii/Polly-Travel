using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Coordinator.Proxies;

public interface IFlightServiceProxy
{
    Task<bool> BookAsync(FlightBookingRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> CancelAsync(Guid correlationId, CancellationToken cancellationToken = default);
}