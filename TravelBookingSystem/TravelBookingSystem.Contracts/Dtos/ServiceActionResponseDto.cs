namespace TravelBookingSystem.Contracts.Dtos;

public sealed class ServiceActionResponseDto
{
    public bool Succeeded { get; init; }
    public string Message { get; init; } = string.Empty;
}