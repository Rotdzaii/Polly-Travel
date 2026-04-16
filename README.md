# Lunar Polly - Demo Distributed Booking Saga

## Giới thiệu dự án
Lunar Polly là dự án demo giải quyết bài toán giao dịch phân tán (Distributed Transactions) bằng mô hình Saga Pattern với chiến lược Book and Cancel.

Khi hành khách gửi yêu cầu đặt chuyến đi lên Mặt Trăng, hệ thống cần xử lý thành công qua 3 dịch vụ độc lập:
- Chuyến bay (Space Flight)
- Khám sức khỏe (Hospital Check)
- Khách sạn (Hotel)

Nếu bất kỳ bước nào thất bại, các bước đã thành công trước đó sẽ được hoàn tác tự động (Rollback/Compensation) để đảm bảo tính nhất quán dữ liệu.

## Kiến trúc và công nghệ
Dự án được tổ chức theo hướng tách thành phần (Decoupled Components) để dễ mở rộng và dễ bảo trì.

- Frontend (ReactJS - polly-ui)
  - Cung cấp giao diện người dùng dạng Multi-step Wizard (Flight -> Health Check -> Hotel).
  - Gửi yêu cầu đặt chỗ và theo dõi trạng thái giao dịch theo correlationId.

- Backend API (.NET)
  - Đóng vai trò cổng tiếp nhận yêu cầu (API Gateway).
  - Nhận request từ UI, ghi trạng thái khởi tạo vào SQLite (qua EF Core), sau đó đẩy message vào RabbitMQ để xử lý bất đồng bộ.

- Saga Worker (Coordinator)
  - Là Background Service lắng nghe message từ hàng đợi.
  - Điều phối tuần tự các bước booking và kích hoạt luồng bù trừ (Compensation) khi có lỗi.

- Mock Services
  - Mô phỏng dịch vụ Hospital, Hotel, Spaceflight.
  - Có độ trễ và xác suất lỗi ngẫu nhiên để kiểm thử luồng Success và Rollback.

- Message Broker và Database
  - RabbitMQ: trung chuyển message giữa API và Worker.
  - SQLite + EF Core: lưu trạng thái giao dịch.

## Luồng xử lý nghiệp vụ (Workflow)
Hệ thống sử dụng cơ chế Book and Cancel thay cho Two-Phase Commit vì các hệ thống bên thứ ba không hỗ trợ lock tài nguyên lâu dài.

1. Submit
   - Người dùng điền thông tin trên Wizard và nhấn Submit.

2. Queue
   - API nhận request, trả về trạng thái Accepted/Processing.
   - API phát hành BookingRequestedMessage vào RabbitMQ.

3. Process
   - Saga Worker lấy message và xử lý lần lượt các bước booking.

4. Success hoặc Rollback
   - Nếu tất cả bước thành công: giao dịch hoàn tất thành công.
   - Nếu một bước thất bại: Worker gọi các lệnh Cancel tương ứng cho các bước đã thành công trước đó.

## Cấu trúc repository
Đây là mono-repo gồm cả backend và frontend:

- TravelBookingSystem/
  - TravelBookingSystem.Api (Web API)
  - SagaWorker (Background Worker cho Saga orchestration)
  - TravelBookingSystem.Services.Mock (dịch vụ giả lập)
  - TravelBookingSystem.Contracts, TravelBookingSystem.Coordinator (domain/contracts dùng chung)
- polly-ui/ (React + Vite + Tailwind frontend)
- demo-full.ps1, demo-full.bat (script chạy nhanh toàn hệ thống)

## Yêu cầu môi trường (Prerequisites)
- .NET SDK 8.x
- Node.js 18+ và npm
- RabbitMQ chạy local:
  - Host: localhost
  - Port: 5672
  - Username: guest
  - Password: guest

## Khởi động nhanh (Windows)
Từ thư mục gốc dự án:
- PowerShell: .\demo-full.ps1
- CMD: demo-full.bat

Script sẽ lần lượt khởi chạy:
1. Mock Services
2. SagaWorker
3. API
4. Polly UI

Sau đó mở giao diện tại:
- http://localhost:5173

## Khởi động thủ công

### 1) Chạy backend
Mở 3 terminal trong thư mục TravelBookingSystem/:

Terminal A:
```bash
dotnet run --project .\TravelBookingSystem.Services.Mock
```

Terminal B:
```bash
dotnet run --project .\SagaWorker
```

Terminal C:
```bash
dotnet run --project .\TravelBookingSystem.Api
```

API URL (Development):
- http://localhost:5143
- http://localhost:5000
- Swagger: http://localhost:5143/swagger

### 2) Chạy frontend
Mở terminal trong thư mục polly-ui/:

```bash
npm install
npm run dev
```

Frontend URL:
- http://localhost:5173

## API chính frontend đang sử dụng
- POST /api/applications
  - Full URL: http://localhost:5143/api/applications
- GET /api/bookings/{correlationId}

Ví dụ payload cho POST:
```json
{
  "customerName": "Flight Eligibility Applicant",
  "medicalPackageCode": "MED-STANDARD",
  "hotelCode": "LUNAR-HOTEL-A",
  "nights": 3,
  "flightCode": "FLIGHT-001",
  "seatClass": "Economy"
}
```

## Cơ sở dữ liệu và biến môi trường
File SQLite travel-booking-sm.db được cấu hình theo relative path trong API và SagaWorker.

Có thể override đường dẫn DB bằng biến môi trường:
- TRAVEL_BOOKING_DB_PATH

## CORS
API đã cấu hình CORS cho frontend origin:
- http://localhost:5173

Method được cho phép gồm:
- GET
- POST
- PUT
- DELETE
- OPTIONS

## Lệnh build
Trong TravelBookingSystem/:
```bash
dotnet build .\TravelBookingSystem.sln
```

Trong polly-ui/:
```bash
npm run build
```

## Khắc phục sự cố
- Nếu booking không chạy tiếp, kiểm tra RabbitMQ đã chạy chưa.
- Nếu API/Worker báo lỗi không mở được SQLite, kiểm tra file travel-booking-sm.db có tồn tại trong TravelBookingSystem/.
- Nếu trùng cổng, dừng các tiến trình dotnet cũ rồi chạy lại.
