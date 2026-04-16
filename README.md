# Lunar Polly - Distributed Booking Saga Demo


This repository is a mono-repo containing:
- Backend .NET solution: TravelBookingSystem
- Frontend React + Vite app: polly-ui

Core idea:
- API receives a booking/application request
- Request is published to queue
- SagaWorker orchestrates booking/compensation
- Frontend lets users submit a flow and track status by correlationId

## Repository Structure
- TravelBookingSystem/
  - TravelBookingSystem.Api (Web API)
  - SagaWorker (background worker for Saga orchestration)
  - TravelBookingSystem.Services.Mock (mock downstream services)
  - TravelBookingSystem.Contracts, TravelBookingSystem.Coordinator (shared/domain logic)
- polly-ui/ (React + Vite + Tailwind frontend)
- demo-full.ps1 / demo-full.bat (quick startup scripts)

## Prerequisites
- .NET SDK 8.x
- Node.js 18+ and npm
- RabbitMQ running locally at:
  - Host: localhost
  - Port: 5672
  - Username: guest
  - Password: guest

## Quick Start (Windows)
From repository root:
- PowerShell: .\demo-full.ps1
- CMD: demo-full.bat

This script starts:
1) Mock Services
2) SagaWorker
3) API
4) Polly UI

Then open:
- UI: http://localhost:5173

## Manual Setup
### 1) Start backend services
Open 3 terminals in TravelBookingSystem/:

Terminal A:
- dotnet run --project .\TravelBookingSystem.Services.Mock

Terminal B:
- dotnet run --project .\SagaWorker

Terminal C:
- dotnet run --project .\TravelBookingSystem.Api

API URLs (development):
- http://localhost:5143
- http://localhost:5000
- Swagger: http://localhost:5143/swagger

### 2) Start frontend
Open terminal in polly-ui/:
- npm install
- npm run dev

Frontend URL:
- http://localhost:5173

## API Endpoints Used by Frontend
- POST /api/applications
  - Full URL: http://localhost:5143/api/applications
- GET /api/bookings/{correlationId}

Sample POST payload:
{
  "customerName": "Flight Eligibility Applicant",
  "medicalPackageCode": "MED-STANDARD",
  "hotelCode": "LUNAR-HOTEL-A",
  "nights": 3,
  "flightCode": "FLIGHT-001",
  "seatClass": "Economy"
}

## Database Note
SQLite file (travel-booking-sm.db) is configured via relative path in API/Worker.
You can also override by setting environment variable:
- TRAVEL_BOOKING_DB_PATH

## CORS Note
API CORS policy already allows frontend origin:
- http://localhost:5173

Allowed methods include GET, POST, PUT, DELETE, OPTIONS.

## Build Commands
From TravelBookingSystem/:
- dotnet build .\TravelBookingSystem.sln

From polly-ui/:
- npm run build

## Troubleshooting
- If booking does not progress, check RabbitMQ is running.
- If API cannot open SQLite file, confirm travel-booking-sm.db exists in TravelBookingSystem/.
- If port conflicts occur, stop old dotnet processes and restart services.
