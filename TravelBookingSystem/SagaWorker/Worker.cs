using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TravelBookingSystem.Contracts.Dtos;
using TravelBookingSystem.Contracts.Enums;
using TravelBookingSystem.Contracts.Messaging.Contracts;
using TravelBookingSystem.Coordinator.Data;
using TravelBookingSystem.Coordinator.Infrastructure.Messaging;
using TravelBookingSystem.Coordinator.Proxies;

namespace SagaWorker;

public sealed class Worker(
    IRabbitMqConsumer consumer,
    IRabbitMqPublisher publisher,
    IServiceScopeFactory scopeFactory,
    ILogger<Worker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await consumer.StartConsumingAsync(HandleEnvelopeAsync, stoppingToken);
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }

    private async Task HandleEnvelopeAsync(string json)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<TravelBookingDbContext>();
        var medicalProxy = scope.ServiceProvider.GetRequiredService<IMedicalServiceProxy>();
        var hotelProxy = scope.ServiceProvider.GetRequiredService<IHotelServiceProxy>();
        var flightProxy = scope.ServiceProvider.GetRequiredService<IFlightServiceProxy>();

        var envelope = JsonSerializer.Deserialize<SagaMessageEnvelope>(json);
        if (envelope is null)
        {
            return;
        }

        switch (envelope.MessageType)
        {
            case nameof(BookingRequestedMessage):
                {
                    var message = JsonSerializer.Deserialize<BookingRequestedMessage>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleBookingRequestedAsync(message, dbContext);
                    }

                    break;
                }
            case nameof(BookHospitalCommand):
                {
                    var message = JsonSerializer.Deserialize<BookHospitalCommand>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleBookHospitalAsync(message, dbContext, medicalProxy);
                    }

                    break;
                }
            case nameof(BookHotelCommand):
                {
                    var message = JsonSerializer.Deserialize<BookHotelCommand>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleBookHotelAsync(message, dbContext, hotelProxy);
                    }

                    break;
                }
            case nameof(BookFlightCommand):
                {
                    var message = JsonSerializer.Deserialize<BookFlightCommand>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleBookFlightAsync(message, dbContext, flightProxy);
                    }

                    break;
                }
            case nameof(CancelHotelCommand):
                {
                    var message = JsonSerializer.Deserialize<CancelHotelCommand>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleCancelHotelAsync(message, dbContext, hotelProxy);
                    }

                    break;
                }
            case nameof(CancelHospitalCommand):
                {
                    var message = JsonSerializer.Deserialize<CancelHospitalCommand>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleCancelHospitalAsync(message, dbContext, medicalProxy);
                    }

                    break;
                }
            case nameof(CancelFlightCommand):
                {
                    var message = JsonSerializer.Deserialize<CancelFlightCommand>(envelope.BodyJson);
                    if (message is not null)
                    {
                        await HandleCancelFlightAsync(message, flightProxy);
                    }

                    break;
                }
        }
    }

    private async Task HandleBookingRequestedAsync(BookingRequestedMessage message, TravelBookingDbContext dbContext)
    {
        logger.LogInformation("SagaStarted BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookingRequestedMessage), BookingStatus.Initial);
        var record = await GetOrCreateRecordAsync(dbContext, message.BookingId);
        await TransitionStateAsync(dbContext, record, BookingStatus.Initial);

        await publisher.PublishAsync(new BookHospitalCommand
        {
            BookingId = message.BookingId,
            Timestamp = DateTime.UtcNow,
            Payload = message.Payload
        });
    }

    private async Task HandleBookHospitalAsync(BookHospitalCommand message, TravelBookingDbContext dbContext, IMedicalServiceProxy medicalProxy)
    {
        var request = BuildRequest(message.BookingId, message.Payload);
        var record = await GetOrCreateRecordAsync(dbContext, message.BookingId);

        var booked = await medicalProxy.BookAsync(request.Medical);
        if (!booked)
        {
            await TransitionStateAsync(dbContext, record, BookingStatus.Failed);
            logger.LogInformation("SagaFailed BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookHospitalCommand), BookingStatus.Failed);

            await publisher.PublishAsync(new BookingFailedEvent
            {
                BookingId = message.BookingId,
                Timestamp = DateTime.UtcNow,
                Payload = "Hospital booking failed"
            });
            return;
        }

        record.MedicalBooked = true;
        await dbContext.SaveChangesAsync();
        await TransitionStateAsync(dbContext, record, BookingStatus.MedicalCleared);
        logger.LogInformation("HospitalBooked BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookHospitalCommand), BookingStatus.MedicalCleared);

        await publisher.PublishAsync(new BookHotelCommand
        {
            BookingId = message.BookingId,
            Timestamp = DateTime.UtcNow,
            Payload = message.Payload
        });
    }

    private async Task HandleBookHotelAsync(BookHotelCommand message, TravelBookingDbContext dbContext, IHotelServiceProxy hotelProxy)
    {
        var request = BuildRequest(message.BookingId, message.Payload);
        var record = await GetOrCreateRecordAsync(dbContext, message.BookingId);

        var booked = await hotelProxy.BookAsync(request.Hotel);
        if (!booked)
        {
            await TransitionStateAsync(dbContext, record, BookingStatus.Compensating);
            logger.LogInformation("SagaCompensationStarted BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookHotelCommand), BookingStatus.Compensating);

            await publisher.PublishAsync(new CancelHospitalCommand
            {
                BookingId = message.BookingId,
                Timestamp = DateTime.UtcNow,
                Payload = message.Payload
            });
            return;
        }

        record.HotelBooked = true;
        await dbContext.SaveChangesAsync();
        await TransitionStateAsync(dbContext, record, BookingStatus.HotelReserved);
        logger.LogInformation("HotelBooked BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookHotelCommand), BookingStatus.HotelReserved);

        await publisher.PublishAsync(new BookFlightCommand
        {
            BookingId = message.BookingId,
            Timestamp = DateTime.UtcNow,
            Payload = message.Payload
        });
    }

    private async Task HandleBookFlightAsync(BookFlightCommand message, TravelBookingDbContext dbContext, IFlightServiceProxy flightProxy)
    {
        var request = BuildRequest(message.BookingId, message.Payload);
        var record = await GetOrCreateRecordAsync(dbContext, message.BookingId);

        var booked = await flightProxy.BookAsync(request.Flight);
        if (!booked)
        {
            await TransitionStateAsync(dbContext, record, BookingStatus.Compensating);
            logger.LogInformation("SagaCompensationStarted BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookFlightCommand), BookingStatus.Compensating);

            await publisher.PublishAsync(new CancelHotelCommand
            {
                BookingId = message.BookingId,
                Timestamp = DateTime.UtcNow,
                Payload = message.Payload
            });
            return;
        }

        await TransitionStateAsync(dbContext, record, BookingStatus.Success);
        logger.LogInformation("FlightBooked BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookFlightCommand), BookingStatus.Success);

        await publisher.PublishAsync(new BookingCompletedEvent
        {
            BookingId = message.BookingId,
            Timestamp = DateTime.UtcNow,
            Payload = message.Payload
        });

        logger.LogInformation("SagaCompleted BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(BookingCompletedEvent), BookingStatus.Success);
    }

    private async Task HandleCancelHotelAsync(CancelHotelCommand message, TravelBookingDbContext dbContext, IHotelServiceProxy hotelProxy)
    {
        var record = await GetOrCreateRecordAsync(dbContext, message.BookingId);
        if (record.HotelBooked && !record.HotelCancelled)
        {
            var cancelled = await hotelProxy.CancelAsync(message.BookingId);
            if (cancelled)
            {
                record.HotelCancelled = true;
                await dbContext.SaveChangesAsync();
            }
        }

        await publisher.PublishAsync(new CancelHospitalCommand
        {
            BookingId = message.BookingId,
            Timestamp = DateTime.UtcNow,
            Payload = message.Payload
        });
    }

    private async Task HandleCancelHospitalAsync(CancelHospitalCommand message, TravelBookingDbContext dbContext, IMedicalServiceProxy medicalProxy)
    {
        var record = await GetOrCreateRecordAsync(dbContext, message.BookingId);
        if (record.MedicalBooked && !record.MedicalCancelled)
        {
            var cancelled = await medicalProxy.CancelAsync(message.BookingId);
            if (cancelled)
            {
                record.MedicalCancelled = true;
                await dbContext.SaveChangesAsync();
            }
        }

        await TransitionStateAsync(dbContext, record, BookingStatus.Cancelled);
        logger.LogInformation("SagaFailed BookingId={BookingId} Step={Step} Status={Status}", message.BookingId, nameof(CancelHospitalCommand), BookingStatus.Cancelled);

        await publisher.PublishAsync(new BookingFailedEvent
        {
            BookingId = message.BookingId,
            Timestamp = DateTime.UtcNow,
            Payload = message.Payload
        });
    }

    private async Task HandleCancelFlightAsync(CancelFlightCommand message, IFlightServiceProxy flightProxy)
    {
        await flightProxy.CancelAsync(message.BookingId);
    }

    private BookingRequestDto BuildRequest(Guid bookingId, string payloadJson)
    {
        var payload = JsonSerializer.Deserialize<BookingSagaPayload>(payloadJson) ?? new BookingSagaPayload();
        var correlationId = bookingId.ToString();

        return new BookingRequestDto
        {
            CorrelationId = bookingId,
            CustomerName = payload.CustomerName,
            Medical = new MedicalBookingRequestDto
            {
                CorrelationId = correlationId,
                CustomerName = payload.CustomerName,
                MedicalPackageCode = payload.MedicalPackageCode
            },
            Hotel = new HotelBookingRequestDto
            {
                CorrelationId = correlationId,
                CustomerName = payload.CustomerName,
                HotelCode = payload.HotelCode,
                Nights = payload.Nights
            },
            Flight = new FlightBookingRequestDto
            {
                CorrelationId = correlationId,
                CustomerName = payload.CustomerName,
                FlightCode = payload.FlightCode,
                SeatClass = payload.SeatClass
            }
        };
    }

    private static async Task<BookingRecord> GetOrCreateRecordAsync(TravelBookingDbContext dbContext, Guid bookingId)
    {
        var record = await dbContext.BookingRecords.FirstOrDefaultAsync(x => x.CorrelationId == bookingId);
        if (record is not null)
        {
            return record;
        }

        record = new BookingRecord
        {
            CorrelationId = bookingId,
            CustomerName = "Queued Booking",
            Status = BookingStatus.Initial,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        dbContext.BookingRecords.Add(record);
        await dbContext.SaveChangesAsync();
        return record;
    }

    private async Task TransitionStateAsync(TravelBookingDbContext dbContext, BookingRecord record, BookingStatus newStatus)
    {
        if (record.Status == newStatus)
        {
            return;
        }

        var old = record.Status;
        record.Status = newStatus;
        record.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        logger.LogInformation("[STATE CHANGE] From {Old} To {New}", old, newStatus);
    }
}
