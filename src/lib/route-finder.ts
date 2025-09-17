import type { Stop, BusRoute, Bus, SuggestedRoute } from '@/types';
import { getDistance } from '@/lib/utils';

export function findSuggestedRoutes({
    originId,
    destinationId,
    stops,
    routes,
    buses,
}: {
    originId: string;
    destinationId: string;
    stops: Stop[];
    routes: BusRoute[];
    buses: Bus[];
}): SuggestedRoute[] {
    const originStop = stops.find(s => s.id === originId);
    const destinationStop = stops.find(s => s.id === destinationId);

    if (!originStop || !destinationStop) {
        return [];
    }

    const directRoutes: SuggestedRoute[] = [];
    const connectingRoutes: SuggestedRoute[] = [];

    // Find direct routes
    routes.forEach(route => {
        const originIndex = route.stops.indexOf(originId);
        const destinationIndex = route.stops.indexOf(destinationId);

        if (originIndex !== -1 && destinationIndex !== -1 && originIndex < destinationIndex) {
            // Find the nearest bus on this route that hasn't passed the origin yet
            const availableBuses = buses.filter(b => b.routeId === route.id && b.currentStopIndex <= originIndex);
            
            if (availableBuses.length > 0) {
                let closestBus = availableBuses[0];
                let minDistance = getDistance(closestBus.position, originStop.position);

                for(let i = 1; i < availableBuses.length; i++){
                    const distance = getDistance(availableBuses[i].position, originStop.position);
                    if(distance < minDistance){
                        minDistance = distance;
                        closestBus = availableBuses[i];
                    }
                }
                
                const eta = Math.round(minDistance / closestBus.speed / 5 + 5); // Simulated ETA logic

                directRoutes.push({
                    type: 'direct',
                    legs: [{ route, startStop: originStop, endStop: destinationStop, bus: closestBus, eta }]
                });
            }
        }
    });

    // Find connecting routes (1 connection)
    if (directRoutes.length === 0) {
        routes.forEach(route1 => {
            if (route1.stops.includes(originId)) {
                route1.stops.forEach(transferStopId => {
                    const transferStop = stops.find(s => s.id === transferStopId);
                    if (!transferStop) return;

                    routes.forEach(route2 => {
                        if (route1.id !== route2.id && route2.stops.includes(transferStopId) && route2.stops.includes(destinationId)) {
                            const originIndex1 = route1.stops.indexOf(originId);
                            const transferIndex1 = route1.stops.indexOf(transferStopId);
                            const transferIndex2 = route2.stops.indexOf(transferStopId);
                            const destinationIndex2 = route2.stops.indexOf(destinationId);

                            if (originIndex1 < transferIndex1 && transferIndex2 < destinationIndex2) {
                                const bus1 = buses.find(b => b.routeId === route1.id && b.currentStopIndex <= originIndex1);
                                const bus2 = buses.find(b => b.routeId === route2.id && b.currentStopIndex <= transferIndex2);

                                if (bus1 && bus2 && connectingRoutes.length < 1) { // Limit to one suggestion
                                    const eta1 = Math.round(getDistance(bus1.position, originStop.position) / bus1.speed / 5 + 5);
                                    const eta2 = Math.round(getDistance(bus2.position, transferStop.position) / bus2.speed / 5 + 10);

                                    connectingRoutes.push({
                                        type: 'connecting',
                                        legs: [
                                            { route: route1, startStop: originStop, endStop: transferStop, bus: bus1, eta: eta1 },
                                            { route: route2, startStop: transferStop, endStop: destinationStop, bus: bus2, eta: eta2 }
                                        ]
                                    });
                                }
                            }
                        }
                    });
                });
            }
        });
    }
    
    // Return direct routes if any, otherwise the first connecting route found.
    return [...directRoutes, ...connectingRoutes];
}
