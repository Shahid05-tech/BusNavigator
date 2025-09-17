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

    // Find direct routes
    routes.forEach(route => {
        const originIndex = route.stops.indexOf(originId);
        const destinationIndex = route.stops.indexOf(destinationId);

        if (originIndex > -1 && destinationIndex > -1 && originIndex < destinationIndex) {
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
                const eta = 5 + (stopsBetween * 3) + Math.round( (originIndex - closestBus.currentStopIndex) * 3);

                suggestedRoutes.push({
                    type: 'direct',
                    legs: [{ route, startStop: originStop, endStop: destinationStop, bus: closestBus, eta }]
                });
            }
        }
    });

    // Find connecting routes if no direct routes are found
    if (suggestedRoutes.length === 0) {
        const originRoutes = routes.filter(r => r.stops.includes(originId));
        const destinationRoutes = routes.filter(r => r.stops.includes(destinationId));

        for (const originRoute of originRoutes) {
            for (const destinationRoute of destinationRoutes) {
                if (originRoute.id === destinationRoute.id) continue;

                const originStopIndex = originRoute.stops.indexOf(originId);
                const transferStops = originRoute.stops.filter(stopId => destinationRoute.stops.includes(stopId));

                for (const transferStopId of transferStops) {
                    const transferStop = stops.find(s => s.id === transferStopId);
                    if (!transferStop) continue;
                    
                    const transferStopIndexInOrigin = originRoute.stops.indexOf(transferStopId);
                    const transferStopIndexInDest = destinationRoute.stops.indexOf(transferStopId);
                    const destinationStopIndexInDest = destinationRoute.stops.indexOf(destinationId);

                    if (originStopIndex < transferStopIndexInOrigin && transferStopIndexInDest < destinationStopIndexInDest) {
                         const firstLegBuses = buses.filter(b => b.routeId === originRoute.id && b.currentStopIndex <= originStopIndex);
                         const secondLegBuses = buses.filter(b => b.routeId === destinationRoute.id);

                         if (firstLegBuses.length > 0 && secondLegBuses.length > 0) {
                            const firstBus = firstLegBuses[0];
                            const secondBus = secondLegBuses[0];

                            const eta1 = 5 + ((transferStopIndexInOrigin - originStopIndex) * 3);
                            const eta2 = 10 + ((destinationStopIndexInDest - transferStopIndexInDest) * 3); // 10 min for transfer

                            suggestedRoutes.push({
                                type: 'connecting',
                                legs: [
                                    { route: originRoute, startStop: originStop, endStop: transferStop, bus: firstBus, eta: eta1 },
                                    { route: destinationRoute, startStop: transferStop, endStop: destinationStop, bus: secondBus, eta: eta2 }
                                ]
                            });
                         }
                    }
                }
            }
        }
    }


    // If no direct routes are found following the logic,
    // show any bus on a route that services both stops.
    if (suggestedRoutes.length === 0) {
        const relevantRoutes = routes.filter(route => 
            route.stops.includes(originId) && route.stops.includes(destinationId)
        );
        relevantRoutes.forEach(route => {
            const relevantBuses = buses.filter(bus => bus.routeId === route.id);
            relevantBuses.forEach(bus => {
                 // Avoid adding duplicates
                if (suggestedRoutes.some(sr => sr.legs.some(leg => leg.bus.id === bus.id))) return;

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
        const etaA = a.legs.reduce((acc, leg) => acc + leg.eta, 0);
        const etaB = b.legs.reduce((acc, leg) => acc + leg.eta, 0);

        if (etaA < 0 && etaB >= 0) return 1;
        if (etaA >= 0 && etaB < 0) return -1;
        if (etaA >= 0 && etaB >= 0) return etaA - etaB;
        return 0;
    });

    return suggestedRoutes;
}
