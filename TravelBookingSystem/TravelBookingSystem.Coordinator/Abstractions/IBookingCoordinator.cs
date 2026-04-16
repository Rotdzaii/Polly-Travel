using TravelBookingSystem.Contracts.Dtos;
using TravelBookingSystem.Contracts.Enums;

namespace TravelBookingSystem.Coordinator.Abstractions;

public interface IBookingCoordinator
{
    Task<BookingExecutionResultDto> StartBookingAsync(BookingRequestDto request, CancellationToken cancellationToken = default);
    Task CompensateAsync(string correlationId, BookingStatus failAtStage, CancellationToken cancellationToken = default);
    Task<BookingStatusResponseDto?> GetBookingStatusAsync(string correlationId, CancellationToken cancellationToken = default);
}