namespace TravelBookingSystem.Contracts.Enums;

public enum BookingStatus
{
    Initial = 0,
    MedicalPending = 1,
    HotelPending = 2,
    FlightPending = 3,
    MedicalCleared = 4,
    HotelReserved = 5,
    Success = 6,
    Failed = 7,
    Compensating = 8,
    Cancelled = 9
}