# Vayubook: A Premium Travel Booking Platform (MakeMyTrip Clone)

Vayubook is an enterprise-grade, responsive travel booking platform designed with a modern glassmorphism aesthetic. It integrates a secure Java + Spring Boot backend with a React + TypeScript frontend.

## Architecture & Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Framer Motion, Axios
- **Backend**: Java 21, Spring Boot 3, Spring Security, JWT (0.12.5), JPA Hibernate
- **Database**: H2 (In-memory, local testing configured)
- **Deployment**: Docker & Docker Compose configured

## Features
- **Integrated Search**: Flights and Hotels with filter sidebars, low-to-high sorting, and class configurations.
- **Security**: JWT-based user registrations and logins (USER and ADMIN roles).
- **Checkout & Wallet**: Simulated card inputs, Net Banking, UPI (with QR code scanner mockup), and wallet funds management.
- **Admin Panel**: CRUD tables for flights/hotels and CSS-rendered bar chart breakdowns of total revenue and bookings.
- **Widgets**: Interactive SVG world map, Currency Converter, Weather widget, AI Trip Planner, and floating Support Chat bot.

## Quick Start (Local Run)

### Prerequisites
- JDK 21+
- Node.js 18+

### Step 1: Run Backend
1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Build and run:
   ```bash
   ./mvnw spring-boot:run
   ```
The backend will run on `http://localhost:8080`.
H2 database console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:makemytrip`, Username: `sa`, empty password).

### Step 2: Run Frontend
1. Go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
The website will load on `http://localhost:5173`.

### Test Account Credentials
- **Admin**: `admin@makemytrip.com` / `admin123`
- **User**: `user@makemytrip.com` / `user123`
