import type { Stop, BusRoute, Bus } from '@/types';

export const stops: Stop[] = [
  // A mix of downtown and suburban names for flavor
  { id: 'stop_1', name: 'Central Station', position: { lat: 5, lng: 5 } },
  { id: 'stop_2', name: 'Market Street', position: { lat: 5, lng: 15 } },
  { id: 'stop_3', name: 'City Hall', position: { lat: 5, lng: 25 } },
  { id: 'stop_4', name: 'Museum Plaza', position: { lat: 5, lng: 35 } },
  { id: 'stop_5', name: 'Oak Avenue', position: { lat: 15, lng: 5 } },
  { id: 'stop_6', name: 'Library Square', position: { lat: 15, lng: 15 } },
  { id: 'stop_7', name: 'University Campus', position: { lat: 15, lng: 25 } },
  { id: 'stop_8', name: 'Tech Park', position: { lat: 15, lng: 35 } },
  { id: 'stop_9', name: 'Maple Drive', position: { lat: 25, lng: 5 } },
  { id: 'stop_10', name: 'Community Center', position: { lat: 25, lng: 15 } },
  { id: 'stop_11', name: 'Westside Mall', position: { lat: 25, lng: 25 } },
  { id: 'stop_12', name: 'Elm Street', position: { lat: 25, lng: 35 } },
  { id: 'stop_13', name: 'Pine Street', position: { lat: 35, lng: 5 } },
  { id: 'stop_14', name: 'Riverfront Park', position: { lat: 35, lng: 15 } },
  { id: 'stop_15', name: 'Northgate Center', position: { lat: 35, lng: 25 } },
  { id: 'stop_16', name: 'Lakeside', position: { lat: 35, lng: 35 } },
];

export const routes: BusRoute[] = [
  {
    id: 'route_A',
    name: 'Route A (East-West Express)',
    stops: ['stop_1', 'stop_2', 'stop_3', 'stop_4'],
  },
  {
    id: 'route_B',
    name: 'Route B (North-South Connector)',
    stops: ['stop_4', 'stop_8', 'stop_12', 'stop_16'],
  },
  {
    id: 'route_C',
    name: 'Route C (City Loop)',
    stops: ['stop_1', 'stop_5', 'stop_9', 'stop_10', 'stop_6', 'stop_2'],
  },
  {
    id: 'route_D',
    name: 'Route D (Suburban Link)',
    stops: ['stop_13', 'stop_14', 'stop_10', 'stop_11', 'stop_7'],
  },
];

export const initialBuses: Bus[] = [
  { id: 'bus_101', routeId: 'route_A', currentStopIndex: 0, progress: 0.5, speed: 0.1, position: { lat: 5, lng: 10 } },
  { id: 'bus_102', routeId: 'route_A', currentStopIndex: 2, progress: 0.2, speed: 0.1, position: { lat: 5, lng: 27 } },
  { id: 'bus_201', routeId: 'route_B', currentStopIndex: 1, progress: 0.8, speed: 0.1, position: { lat: 23, lng: 35 } },
  { id: 'bus_301', routeId: 'route_C', currentStopIndex: 3, progress: 0.1, speed: 0.08, position: { lat: 25, lng: 13 } },
  { id: 'bus_401', routeId: 'route_D', currentStopIndex: 4, progress: 0.9, speed: 0.09, position: { lat: 17, lng: 25 } },
];
