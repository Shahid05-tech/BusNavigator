# **App Name**: Bus Navigator

## Core Features:

- Real-Time Bus Tracking: Display real-time locations of buses on a map, with simulated data until actual GPS integration is ready.
- Location Autocomplete: Integrate with the Ola Maps Places API to provide autocomplete suggestions and validation for user-entered locations.
- Direct Bus Route Suggestions: Suggest direct bus routes based on the user's origin and destination, displaying bus numbers, expected arrival times, and route details. LLM tool to provide dynamic rerouting if it senses disruptions
- Connecting Bus Suggestions: Suggest connecting bus routes if a direct bus is not available, providing a sequence of buses and intermediate stops.
- Estimated Arrival Time: Calculate and display estimated arrival times based on simulated bus speed and distance from the nearest bus stand. Later versions can take the GPS data of the buses.
- Map Display: Display bus routes and buses on the Ola Maps map, visually highlighting the suggested routes.
- Bus Information Storage: Store and manage bus-related information, including bus ID, route, timings, and current bus stop. Bus location will be updated via GPS when available. 

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to evoke a sense of reliability and technology.
- Background color: Light gray (#F0F0F0) to provide a clean and modern backdrop.
- Accent color: A warm orange (#F26419) for interactive elements and call-to-action buttons.
- Font pairing: 'Poppins' (sans-serif) for headlines and 'PT Sans' (sans-serif) for body text.
- Use clear and recognizable icons for bus stops, routes, and other map elements.
- Maintain a clean and intuitive layout, prioritizing real-time information and ease of navigation.
- Implement smooth transitions and subtle animations for bus movements and data updates.