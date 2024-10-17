# Travel Management System

## Project Overview
This Travel Management System is a comprehensive web application designed to facilitate various aspects of travel planning and management. It includes features for hotel bookings, restaurant reservations, transportation information, event management, and an information center.

## Key Features
- User Authentication (Login/Register)
- Hotel Management
  - View hotel details and guest services
  - Book hotel rooms
  - Leave and manage reviews
  - View hotel orders
- Restaurant Management
  - View restaurant details and menus
  - Make table reservations
  - Place and manage food orders
  - View restaurant orders and table reservations
- Transportation Information
  - View transportation providers and route planning
  - Book rides
  - Check traffic updates
  - View ride orders
- Event Management
  - Browse and search events
  - Register for events
  - View event orders
- Tour Management
  - Explore tour destinations
  - View tour details
  - Book tours
  - Manage tour orders
- Information Center
  - Access travel guides and tips
  - View local attractions and events
- Event Logging System
  - View event logs
  - Download event logs as CSV
  - Clear event logs
- Multi-language Support
- User Profile Management

## Technology Stack
- Frontend: React.js
- State Management: React Context API
- Routing: React Router
- UI Components: Material-UI, Heroicons
- Internationalization: react-i18next
- HTTP Client: Axios
- Styling: Tailwind CSS
- Animations: React Transition Group

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation
1. Clone the repository:
   ```
   git clone [your-repository-url]
   ```
2. Navigate to the project directory:
   ```
   cd travel-management-system
   ```
3. Install dependencies:
   ```
   npm install
   ```


### Running the Application
1. Start the development server:
   ```
   npm start
   ```
2. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## Project Structure
- `src/components`: Reusable React components
- `src/pages`: Individual page components (Home, Hotels, Restaurants, Events, Tours, etc.)
- `src/context`: React Context for state management (AuthContext)
- `src/utils`: Utility functions and API calls
- `public/locales`: Internationalization files

## Key Components
- `Navbar`: Navigation component
- `HotelDetail`: Displays detailed information about a hotel
- `RestaurantDetail`: Shows restaurant information, menu, and reservation options
- `TransportationInfo`: Provides transportation details and booking options
- `EventLog`: Manages and displays system event logs
- `BookingModule`: Handles various types of bookings (hotel, restaurant, tour)
- `TableReservations`: Manages restaurant table reservations
- `TourDetail`: Displays tour information and booking options
- `Profile`: User profile management

## Authentication
The system uses JWT (JSON Web Tokens) for authentication. The `AuthContext` provides login, register, and logout functionalities.

## API Integration
API calls are centralized in the `api.js` file, which uses Axios for HTTP requests. The base URL can be configured via environment variables.

## Internationalization
The application supports multiple languages using react-i18next. Language files are stored in the `public/locales` directory.
