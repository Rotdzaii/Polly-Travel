using TravelBookingSystem.Contracts.Enums;

namespace TravelBookingSystem.Coordinator.Data;

public sealed class BookingRecord
{
    public int Id { get; set; }
    public Guid CorrelationId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public BookingStatus Status { get; set; } = BookingStatus.Initial;
    public bool MedicalBooked { get; set; }
    public bool HotelBooked { get; set; }
    public bool MedicalCancelled { get; set; }
    public bool HotelCancelled { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}