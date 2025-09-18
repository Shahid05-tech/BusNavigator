export interface Stop {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  realPosition: { lat: number; lng: number };
}

export interface BusRoute {
  id: string;
  name: string;
  stops: string[]; // array of stop IDs
}

export interface Bus {
  id: string;
  routeId: string;
  name: string;
  currentStopIndex: number;
  position: { lat: number; lng: number };
  // progress to next stop, 0 to 1
  progress: number;
  speed: number; // in units per tick
}

export type SuggestedRoute = {
  type: 'direct' | 'connecting';
  legs: {
    route: BusRoute;
    startStop: Stop;
    endStop: Stop;
    bus: Bus;
    eta: number; // in minutes
  }[];
};
