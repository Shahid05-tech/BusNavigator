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

    const directRoutes: SuggestedRoute[] = [];
    const connectingRoutes: SuggestedRoute[] = [];

    // Find direct routes, considering both directions
    routes.forEach(route => {
        const originIndex = route.stops.indexOf(originId);
        const destinationIndex = route.stops.indexOf(destinationId);

        if (originIndex !== -1 && destinationIndex !== -1) {
            // This handles routes where the journey is in the defined stop order
            if (originIndex < destinationIndex) {
                const availableBuses = buses.filter(b => 
                    b.routeId === route.id && 
                    (b.currentStopIndex < originIndex || (b.currentStopIndex === originIndex && b.progress < 1))
                );

                if (availableBuses.length > 0) {
                    const closestBus = availableBuses.reduce((prev, curr) => {
                        return getDistance(prev.position, originStop.position) < getDistance(curr.position, originStop.position) ? prev : curr;
                    });
                    
                    const stopsBetween = destinationIndex - originIndex;
                    const eta = Math.round(getDistance(closestBus.position, originStop.position) / closestBus.speed / 20) + (stopsBetween * 2);

                    directRoutes.push({
                        type: 'direct',
                        legs: [{ route, startStop: originStop, endStop: destinationStop, bus: closestBus, eta }]
                    });
                }
            }
        }
    });
    
    // Find connecting routes (1 connection)
    routes.forEach(route1 => {
        const originIndex1 = route1.stops.indexOf(originId);
        if (originIndex1 === -1) return;

        routes.forEach(route2 => {
            if (route1.id === route2.id) return;

            const commonStopIds = route1.stops.filter(stopId => route2.stops.includes(stopId));

            commonStopIds.forEach(transferStopId => {
                const transferStop = stops.find(s => s.id === transferStopId);
                if (!transferStop) return;

                const originIndexOnRoute1 = route1.stops.indexOf(originId);
                const transferIndexOnRoute1 = route1.stops.indexOf(transferStopId);
                
                const transferIndexOnRoute2 = route2.stops.indexOf(transferStopId);
                const destinationIndexOnRoute2 = route2.stops.indexOf(destinationId);

                if (originIndexOnRoute1 < transferIndexOnRoute1 && transferIndexOnRoute2 < destinationIndexOnRoute2) {
                     if (connectingRoutes.some(cr => cr.legs[0].endStop.id === transferStopId && cr.legs[1].route.id === route2.id)) return;

                    const bus1 = buses.find(b => 
                        b.routeId === route1.id &&
                        (b.currentStopIndex < originIndexOnRoute1 || (b.currentStopIndex === originIndexOnRoute1 && b.progress < 1))
                    );
                    const bus2 = buses.find(b => 
                        b.routeId === route2.id && 
                        (b.currentStopIndex < transferIndexOnRoute2 || (b.currentStopIndex === transferIndexOnRoute2 && b.progress < 1))
                    );
                    
                    if (bus1 && bus2) {
                        const eta1 = Math.round(getDistance(bus1.position, originStop.position) / bus1.speed / 20) + ((transferIndexOnRoute1 - originIndexOnRoute1) * 2);
                        const eta2 = Math.round(getDistance(bus2.position, transferStop.position) / bus2.speed / 20) + ((destinationIndexOnRoute2 - transferIndexOnRoute2) * 2) + 5;

                        connectingRoutes.push({
                            type: 'connecting',
                            legs: [
                                { route: route1, startStop: originStop, endStop: transferStop, bus: bus1, eta: eta1 },
                                { route: route2, startStop: transferStop, endStop: destinationStop, bus: bus2, eta: eta2 }
                            ]
                        });
                    }
                }
            });
        });
    });

    const allSuggestedRoutes = [...directRoutes, ...connectingRoutes];

    // Sort all routes by total ETA
    allSuggestedRoutes.sort((a, b) => {
        const totalEtaA = a.legs.reduce((sum, leg) => sum + leg.eta, 0);
        const totalEtaB = b.legs.reduce((sum, leg) => sum + leg.eta, 0);
        return totalEtaA - totalEtaB;
    });

    return allSuggestedRoutes;
}
