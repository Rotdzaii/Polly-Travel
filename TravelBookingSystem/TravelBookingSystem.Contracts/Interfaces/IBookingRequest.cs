using TravelBookingSystem.Contracts.Dtos;

namespace TravelBookingSystem.Contracts.Interfaces;

public interface IBookingRequest
{
    Guid CorrelationId { get; }
    string CustomerName { get; }
    MedicalBookingRequestDto Medical { get; }
    HotelBookingRequestDto Hotel { get; }
    FlightBookingRequestDto Flight { get; }
}