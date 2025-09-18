import type { Bus, BusRoute, Stop, SuggestedRoute } from '@/types';
import { getDistance } from '@/lib/utils';

// New, more robust route finding logic
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

    // 1. Find Direct Routes
    routes.forEach(route => {
        const originIndex = route.stops.indexOf(originId);
        const destinationIndex = route.stops.indexOf(destinationId);

        // Check for direct travel in the defined stop order
        if (originIndex !== -1 && destinationIndex !== -1 && originIndex < destinationIndex) {
            const availableBuses = buses.filter(bus => 
                bus.routeId === route.id && bus.currentStopIndex <= originIndex
            );
            
            if (availableBuses.length > 0) {
                 const closestBus = availableBuses.reduce((prev, curr) => 
                    (originIndex - prev.currentStopIndex) < (originIndex - curr.currentStopIndex) ? prev : curr
                );

                const stopsToBus = originIndex - closestBus.currentStopIndex;
                const stopsToTravel = destinationIndex - originIndex;
                const eta = Math.round(stopsToBus * 2.5 + stopsToTravel * 3);

                suggestedRoutes.push({
                    type: 'direct',
                    legs: [{ route, startStop: originStop, endStop: destinationStop, bus: closestBus, eta }]
                });
            }
        }
    });

    // 2. Find Connecting Routes
    if (suggestedRoutes.length < 2) {
      const originRoutes = routes.filter(r => r.stops.includes(originId));
      const destinationRoutes = routes.filter(r => r.stops.includes(destinationId));

      for (const originRoute of originRoutes) {
          const originStopIndex = originRoute.stops.indexOf(originId);
          for (const destinationRoute of destinationRoutes) {
              if (originRoute.id === destinationRoute.id) continue;

              // Find common transfer stops
              const transferStopIds = originRoute.stops.filter(stopId => destinationRoute.stops.includes(stopId));

              for (const transferStopId of transferStopIds) {
                   const transferStop = stops.find(s => s.id === transferStopId);
                   if (!transferStop) continue;

                   const transferIndexInOrigin = originRoute.stops.indexOf(transferStopId);
                   const transferIndexInDest = destinationRoute.stops.indexOf(transferStopId);
                   const destinationIndexInDest = destinationRoute.stops.indexOf(destinationId);

                   // Check if the path is logical
                   if (originStopIndex < transferIndexInOrigin && transferIndexInDest < destinationIndexInDest) {
                        const firstLegBuses = buses.filter(b => b.routeId === originRoute.id && b.currentStopIndex <= originStopIndex);
                        const secondLegBuses = buses.filter(b => b.routeId === destinationRoute.id); // Any bus on 2nd route is fine for now

                        if (firstLegBuses.length > 0 && secondLegBuses.length > 0) {
                           const firstBus = firstLegBuses[0];
                           const secondBus = secondLegBuses[0];

                           const eta1 = Math.round((transferIndexInOrigin - originStopIndex) * 3);
                           const eta2 = Math.round((destinationIndexInDest - transferIndexInDest) * 3) + 5; // Add 5 mins for transfer

                           suggestedRoutes.push({
                               type: 'connecting',
                               legs: [
                                   { route: originRoute, startStop: originStop, endStop: transferStop, bus: firstBus, eta: eta1 },
                                   { route: destinationRoute, startStop: transferStop, endStop: destinationStop, bus: secondBus, eta: eta2 }
                               ]
                           });
                           // Take the first valid connection found for simplicity
                           break; 
                        }
                   }
              }
               if (suggestedRoutes.some(r => r.type === 'connecting')) break;
          }
           if (suggestedRoutes.some(r => r.type === 'connecting')) break;
      }
    }
    
    // 3. Fallback: Find any bus on a route that services both stops, regardless of direction or current position
    if (suggestedRoutes.length === 0) {
        routes.forEach(route => {
            if (route.stops.includes(originId) && route.stops.includes(destinationId)) {
                const relevantBuses = buses.filter(bus => bus.routeId === route.id);
                if (relevantBuses.length > 0) {
                    // Avoid adding duplicates if already found
                    if (suggestedRoutes.some(sr => sr.legs.some(leg => leg.route.id === route.id))) return;
                    
                    suggestedRoutes.push({
                        type: 'direct',
                        legs: [{
                            route: route,
                            startStop: originStop,
                            endStop: destinationStop,
                            bus: relevantBuses[0], // just pick the first one
                            eta: -1 // Indicates no direct path ETA could be calculated
                        }]
                    });
                }
            }
        });
    }

    // Sort routes: direct with ETA, connecting, direct without ETA
    suggestedRoutes.sort((a, b) => {
        const totalEtaA = a.legs.reduce((acc, leg) => acc + (leg.eta > 0 ? leg.eta : 0), 0);
        const totalEtaB = b.legs.reduce((acc, leg) => acc + (leg.eta > 0 ? leg.eta : 0), 0);

        if (a.type === 'direct' && a.legs[0].eta > 0 && (b.type !== 'direct' || b.legs[0].eta <= 0)) return -1;
        if (b.type === 'direct' && b.legs[0].eta > 0 && (a.type !== 'direct' || a.legs[0].eta <= 0)) return 1;

        if (a.type === 'connecting' && b.type === 'direct' && b.legs[0].eta <= 0) return -1;
        if (b.type === 'connecting' && a.type === 'direct' && a.legs[0].eta <= 0) return 1;

        return totalEtaA - totalEtaB;
    });

    return suggestedRoutes.slice(0, 3); // Limit to 3 suggestions
}
