using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Coordinator.Proxies;

public interface IMedicalServiceProxy
{
    Task<bool> BookAsync(MedicalBookingRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> CancelAsync(Guid correlationId, CancellationToken cancellationToken = default);
}