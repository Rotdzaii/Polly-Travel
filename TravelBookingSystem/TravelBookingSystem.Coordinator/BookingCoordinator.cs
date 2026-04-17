using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TravelBookingSystem.Contracts.Dtos;
using TravelBookingSystem.Contracts.Enums;
using TravelBookingSystem.Coordinator.Abstractions;
using TravelBookingSystem.Coordinator.Data;
using TravelBookingSystem.Coordinator.Proxies;

namespace TravelBookingSystem.Coordinator;

public sealed class BookingCoordinator(
    TravelBookingDbContext dbContext,
    IMedicalServiceProxy medicalProxy,
    IHotelServiceProxy hotelProxy,
    IFlightServiceProxy flightProxy,
    ILogger<BookingCoordinator> logger) : IBookingCoordinator
{
    public async Task<BookingExecutionResultDto> StartBookingAsync(BookingRequestDto request, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[SAGA START] ID: {CorrelationId}", request.CorrelationId);

        var record = await GetOrCreateRecordAsync(request, cancellationToken);
        record.ErrorMessage = null;

        var correlationIdText = request.CorrelationId.ToString();
        request.Medical.CorrelationId = correlationIdText;
        request.Hotel.CorrelationId = correlationIdText;
        request.Flight.CorrelationId = correlationIdText;

        var medicalSucceeded = await medicalProxy.BookAsync(request.Medical, cancellationToken);
        if (!medicalSucceeded)
        {
            await FailAsync(record, "Medical booking failed.", cancellationToken);
            return BuildResult(record, false, "Medical booking failed.");
        }

        record.MedicalBooked = true;
        await TransitionToStateAsync(record, BookingStatus.MedicalCleared, cancellationToken);

        var hotelSucceeded = await hotelProxy.BookAsync(request.Hotel, cancellationToken);
        if (!hotelSucceeded)
        {
            await CompensateAsync(correlationIdText, BookingStatus.HotelPending, cancellationToken);
            await FailAsync(record, "Hotel booking failed. Compensation executed.", cancellationToken);
            return BuildResult(record, false, "Hotel booking failed. Compensation executed.");
        }

        record.HotelBooked = true;
        await TransitionToStateAsync(record, BookingStatus.HotelReserved, cancellationToken);

        var flightSucceeded = await flightProxy.BookAsync(request.Flight, cancellationToken);
        if (!flightSucceeded)
        {
            await CompensateAsync(correlationIdText, BookingStatus.FlightPending, cancellationToken);
            await FailAsync(record, "Flight booking failed. Compensation executed.", cancellationToken);
            return BuildResult(record, false, "Flight booking failed. Compensation executed.");
        }

        await TransitionToStateAsync(record, BookingStatus.Success, cancellationToken);
        return BuildResult(record, true, "Booking completed successfully.");
    }

    public async Task CompensateAsync(string correlationId, BookingStatus failAtStage, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(correlationId, out var correlationGuid))
        {
            return;
        }

        var record = await dbContext.BookingRecords.FirstOrDefaultAsync(x => x.CorrelationId == correlationGuid, cancellationToken);
        if (record is null)
        {
            return;
        }

        if (record.Status is BookingStatus.Cancelled)
        {
            return;
        }

        await TransitionToStateAsync(record, BookingStatus.Compensating, cancellationToken);

        // Idempotent rollback: only revert stages that were confirmed and not yet cancelled.
        if (ShouldRevertHotel(failAtStage) && record.HotelBooked && !record.HotelCancelled)
        {
            logger.LogInformation("[COMPENSATING] Reverting stage {Stage}", BookingStatus.HotelReserved);
            var cancelled = await hotelProxy.CancelAsync(record.CorrelationId, cancellationToken);
            if (cancelled)
            {
                record.HotelCancelled = true;
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        if (ShouldRevertMedical(failAtStage) && record.MedicalBooked && !record.MedicalCancelled)
        {
            logger.LogInformation("[COMPENSATING] Reverting stage {Stage}", BookingStatus.MedicalCleared);
            var cancelled = await medicalProxy.CancelAsync(record.CorrelationId, cancellationToken);
            if (cancelled)
            {
                record.MedicalCancelled = true;
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        if ((record.HotelBooked == record.HotelCancelled) && (record.MedicalBooked == record.MedicalCancelled))
        {
            await TransitionToStateAsync(record, BookingStatus.Cancelled, cancellationToken);
        }
    }

    public async Task<BookingStatusResponseDto?> GetBookingStatusAsync(string correlationId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(correlationId, out var correlationGuid))
        {
            return null;
        }

        var booking = await dbContext.BookingRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.CorrelationId == correlationGuid, cancellationToken);

        if (booking is null)
        {
            return null;
        }

        return new BookingStatusResponseDto
        {
            CorrelationId = booking.CorrelationId.ToString(),
            Status = booking.Status.ToString(),
            Message = booking.ErrorMessage,
            LastUpdated = booking.UpdatedAtUtc
        };
    }

    private async Task<BookingRecord> GetOrCreateRecordAsync(BookingRequestDto request, CancellationToken cancellationToken)
    {
        var record = await dbContext.BookingRecords.FirstOrDefaultAsync(x => x.CorrelationId == request.CorrelationId, cancellationToken);
        if (record is not null)
        {
            return record;
        }

        record = new BookingRecord
        {
            CorrelationId = request.CorrelationId,
            CustomerName = request.CustomerName,
            Status = BookingStatus.Initial,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        dbContext.BookingRecords.Add(record);
        await dbContext.SaveChangesAsync(cancellationToken);
        return record;
    }

    private async Task TransitionToStateAsync(BookingRecord record, BookingStatus newStatus, CancellationToken cancellationToken)
    {
        var oldStatus = record.Status;
        if (oldStatus == newStatus)
        {
            return;
        }

        record.Status = newStatus;
        record.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("[STATE CHANGE] From {OldStatus} To {NewStatus}", oldStatus, newStatus);
    }

    private async Task FailAsync(BookingRecord record, string message, CancellationToken cancellationToken)
    {
        record.ErrorMessage = message;
        await TransitionToStateAsync(record, BookingStatus.Failed, cancellationToken);
    }

    private static bool ShouldRevertHotel(BookingStatus failAtStage)
    {
        return failAtStage == BookingStatus.FlightPending;
    }

    private static bool ShouldRevertMedical(BookingStatus failAtStage)
    {
        return failAtStage == BookingStatus.HotelPending || failAtStage == BookingStatus.FlightPending;
    }

    private static BookingExecutionResultDto BuildResult(BookingRecord record, bool succeeded, string message)
    {
        return new BookingExecutionResultDto
        {
            CorrelationId = record.CorrelationId,
            Succeeded = succeeded,
            Status = record.Status,
            Message = message
        };
    }
}