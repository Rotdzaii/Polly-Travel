using TravelBookingSystem.Contracts.Interfaces;

namespace TravelBookingSystem.Contracts.Dtos;

public sealed class BookingRequestDto : IBookingRequest
{
    public Guid CorrelationId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public MedicalBookingRequestDto Medical { get; init; } = new();
    public HotelBookingRequestDto Hotel { get; init; } = new();
    public FlightBookingRequestDto Flight { get; init; } = new();
}