import type { Bus, BusRoute, Stop, SuggestedRoute } from '@/types';
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

    const suggestedRoutes: SuggestedRoute[] = [];

    // Find routes that contain both stops, regardless of order.
    const relevantRoutes = routes.filter(route => 
        route.stops.includes(originId) && route.stops.includes(destinationId)
    );

    relevantRoutes.forEach(route => {
        const originIndex = route.stops.indexOf(originId);
        const destinationIndex = route.stops.indexOf(destinationId);

        // This logic handles a simple direct trip in the order of the stops array.
        if (originIndex < destinationIndex) {
            const availableBuses = buses.filter(bus => 
                bus.routeId === route.id && bus.currentStopIndex <= originIndex
            );

            if (availableBuses.length > 0) {
                const closestBus = availableBuses.reduce((prev, curr) => {
                    const prevDist = getDistance(prev.position, originStop.position) + (originIndex - prev.currentStopIndex) * 100;
                    const currDist = getDistance(curr.position, originStop.position) + (originIndex - curr.currentStopIndex) * 100;
                    return prevDist < currDist ? prev : curr;
                });
                
                const stopsBetween = destinationIndex - originIndex;
                // A very rough ETA calculation
                const eta = 5 + (stopsBetween * 3) + Math.round( (originIndex - closestBus.currentStopIndex) * 3);

                suggestedRoutes.push({
                    type: 'direct',
                    legs: [{ route, startStop: originStop, endStop: destinationStop, bus: closestBus, eta }]
                });
            }
        }
        // This is a new logic to handle reverse direction
        else if (destinationIndex < originIndex) {
             const availableBuses = buses.filter(bus => 
                bus.routeId === route.id && bus.currentStopIndex <= originIndex
            );
             if (availableBuses.length > 0) {
                const closestBus = availableBuses.sort((a,b) => b.currentStopIndex - a.currentStopIndex)[0];
                const stopsBetween = originIndex - destinationIndex;
                const eta = 5 + (stopsBetween * 3);

                 suggestedRoutes.push({
                    type: 'direct',
                    legs: [{ route, startStop: originStop, endStop: destinationStop, bus: closestBus, eta }]
                });
             }
        }
    });

    // If no direct routes are found following the logic,
    // show any bus on a route that services both stops.
    if (suggestedRoutes.length === 0 && relevantRoutes.length > 0) {
        relevantRoutes.forEach(route => {
            const relevantBuses = buses.filter(bus => bus.routeId === route.id);
            relevantBuses.forEach(bus => {
                 // Avoid adding duplicates
                if (suggestedRoutes.some(sr => sr.legs[0].bus.id === bus.id)) return;

                suggestedRoutes.push({
                    type: 'direct',
                    legs: [{
                        route: route,
                        startStop: originStop,
                        endStop: destinationStop,
                        bus: bus,
                        eta: -1 // Indicates no direct path ETA
                    }]
                });
            });
        });
    }


    // Sort routes, putting direct routes with valid ETAs first.
    suggestedRoutes.sort((a, b) => {
        const etaA = a.legs[0].eta;
        const etaB = b.legs[0].eta;

        if (etaA === -1 && etaB !== -1) return 1;
        if (etaA !== -1 && etaB === -1) return -1;
        if (etaA !== -1 && etaB !== -1) return etaA - etaB;
        return 0; // if both are -1, keep original order
    });

    return suggestedRoutes;
}