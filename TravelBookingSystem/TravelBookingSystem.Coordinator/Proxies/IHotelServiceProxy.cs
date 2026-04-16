using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Coordinator.Proxies;

public interface IHotelServiceProxy
{
    Task<bool> BookAsync(HotelBookingRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> CancelAsync(Guid correlationId, CancellationToken cancellationToken = default);
}