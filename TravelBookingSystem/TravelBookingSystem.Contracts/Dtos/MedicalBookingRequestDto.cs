namespace TravelBookingSystem.Contracts.Dtos;

public sealed class MedicalBookingRequestDto
{
    public string CorrelationId { get; set; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string MedicalPackageCode { get; init; } = "MED-STANDARD";
}