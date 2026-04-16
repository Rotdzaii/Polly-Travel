using Microsoft.EntityFrameworkCore;

namespace TravelBookingSystem.Coordinator.Data;

public sealed class TravelBookingDbContext(DbContextOptions<TravelBookingDbContext> options) : DbContext(options)
{
    public DbSet<BookingRecord> BookingRecords => Set<BookingRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BookingRecord>(builder =>
        {
            builder.ToTable("BookingRecords");
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.CorrelationId).IsUnique();
            builder.Property(x => x.CustomerName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.ErrorMessage).HasMaxLength(2000);
            builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
            builder.Property(x => x.MedicalBooked).HasDefaultValue(false);
            builder.Property(x => x.HotelBooked).HasDefaultValue(false);
            builder.Property(x => x.MedicalCancelled).HasDefaultValue(false);
            builder.Property(x => x.HotelCancelled).HasDefaultValue(false);
        });
    }
}