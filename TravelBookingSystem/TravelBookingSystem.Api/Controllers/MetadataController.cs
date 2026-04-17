using Microsoft.AspNetCore.Mvc;

namespace TravelBookingSystem.Api.Controllers;

[ApiController]
[Route("api/metadata")]
public sealed class MetadataController : ControllerBase
{
    private static readonly IReadOnlyList<AirlineMetadataItem> Airlines =
    [
        new("PA-101", "Cathay Pacific", "Ho Chi Minh City (SGN)", "Ha Noi (HAN)", "07:10", "09:20", "2h 10m", 89m, 24, "/public/assets/airlines/Cathay-Pacific.jpg"),
        new("VT-220", "Emirates", "Ho Chi Minh City (SGN)", "Da Nang (DAD)", "08:25", "09:55", "1h 30m", 72m, 16, "/public/assets/airlines/emirates.jpg"),
        new("VN-302", "Vietnam Airlines", "Ha Noi (HAN)", "Phu Quoc (PQC)", "10:40", "12:50", "2h 10m", 118m, 21, "/public/assets/airlines/Vietnam-Airlines.jpg")
    ];

    private static readonly IReadOnlyList<HospitalMetadataItem> Hospitals =
    [
        new("HSP-001", "Cho Ray International", "District 5, Ho Chi Minh City", "General Health Screening", "08:00", "Dr. Tran Minh", 35m, 4.8m, 1240, "/public/assets/hospitals/vinmec-time-city-international-hospital.jpg"),
        new("HSP-002", "Tam Anh Medical Center", "Thu Duc, Ho Chi Minh City", "Cardiology", "09:30", "Dr. Nguyen Hai", 42m, 4.7m, 980, "/public/assets/hospitals/Charite.jpg"),
        new("HSP-003", "Vinmec Central Park", "Binh Thanh, Ho Chi Minh City", "Travel Medical Check", "10:45", "Dr. Le Quynh", 55m, 4.9m, 760, "/public/assets/hospitals/University-Hospital-Zurich.jpg")
    ];

    private static readonly IReadOnlyList<HotelMetadataItem> Hotels =
    [
        new("HOTEL-001", "The Reverie Saigon", "District 1, Ho Chi Minh City", "Deluxe Room", 165m, 4.9m, 1680, ["Free WiFi", "Pool", "Spa", "Airport Shuttle"], "/public/assets/hotels/the-reverie-saigon.jpg"),
        new("HOTEL-002", "Park Hyatt Saigon", "District 1, Ho Chi Minh City", "King Room", 152m, 4.8m, 1420, ["Free WiFi", "Gym", "Restaurant"], "/public/assets/hotels/Park-Hyatt-SaiGon.jpg"),
        new("HOTEL-003", "InterContinental Saigon", "District 1, Ho Chi Minh City", "Executive Suite", 148m, 4.7m, 1190, ["Free WiFi", "Business Lounge", "Spa"], "/public/assets/hotels/InterContinental-Saigon.jpg")
    ];

    [HttpGet("airlines")]
    public ActionResult<IReadOnlyList<AirlineMetadataItem>> GetAirlines()
    {
        return Ok(Airlines);
    }

    [HttpGet("hotels")]
    public ActionResult<IReadOnlyList<HotelMetadataItem>> GetHotels()
    {
        return Ok(Hotels);
    }

    [HttpGet("hospitals")]
    public ActionResult<IReadOnlyList<HospitalMetadataItem>> GetHospitals()
    {
        return Ok(Hospitals);
    }

    public sealed record AirlineMetadataItem(
        string FlightCode,
        string AirlineName,
        string Departure,
        string Arrival,
        string DepartureTime,
        string ArrivalTime,
        string Duration,
        decimal Price,
        int AvailableSeats,
        string ImageUrl);

    public sealed record HospitalMetadataItem(
        string HospitalCode,
        string HospitalName,
        string Location,
        string Specialty,
        string AppointmentTime,
        string DoctorName,
        decimal ConsultationFee,
        decimal Rating,
        int ReviewCount,
        string ImageUrl);

    public sealed record HotelMetadataItem(
        string Id,
        string HotelName,
        string Location,
        string RoomType,
        decimal Price,
        decimal Rating,
        int ReviewCount,
        IReadOnlyList<string> Amenities,
        string ImageUrl);
}
