"use client";

import { useState, useEffect } from "react";
import type { Bus, SuggestedRoute } from "@/types";
import { initialBuses, routes, stops } from "@/lib/data";
import { findSuggestedRoutes } from "@/lib/route-finder";

import Header from "@/components/bus-navigator/header";
import RouteFinder from "@/components/bus-navigator/route-finder";
import MapDisplay from "@/components/bus-navigator/map-display";
import RouteSuggestions from "@/components/bus-navigator/route-suggestions";
import AiFab from "@/components/bus-navigator/ai-fab";

export default function Home() {
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [suggestedRoutes, setSuggestedRoutes] = useState<SuggestedRoute[]>([]);
  const [isFinding, setIsFinding] = useState(false);
  const [highlightedRoute, setHighlightedRoute] = useState<string | null>(null);

  // Bus movement simulation
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          const route = routes.find((r) => r.id === bus.routeId);
          if (!route) return bus;

          let newProgress = bus.progress;
          let currentStopIndex = bus.currentStopIndex;
          
          const startStopOfCurrentLeg = stops.find(s => s.id === route.stops[currentStopIndex]);
          const endStopOfCurrentLeg = stops.find(s => s.id === route.stops[(currentStopIndex + 1) % route.stops.length]);

          if (!startStopOfCurrentLeg || !endStopOfCurrentLeg) return bus;
          
          // A simplified progress increment
          const progressIncrement = bus.speed * 0.1;
          newProgress += progressIncrement;

          if (newProgress >= 1) {
            newProgress = 0;
            currentStopIndex = (currentStopIndex + 1) % route.stops.length;
          }

          const startStop = stops.find((s) => s.id === route.stops[currentStopIndex]);
          const endStop = stops.find((s) => s.id === route.stops[(currentStopIndex + 1) % route.stops.length]);

          if (!startStop || !endStop) return bus;

          const lat = startStop.position.lat + (endStop.position.lat - startStop.position.lat) * newProgress;
          const lng = startStop.position.lng + (endStop.position.lng - startStop.position.lng) * newProgress;

          return {
            ...bus,
            currentStopIndex,
            progress: newProgress,
            position: { lat, lng },
          };
        });
      });
    }, 1000);

    return () => clearInterval(simulationInterval);
  }, []);
  
  const handleFindRoutes = () => {
    if (!origin || !destination) return;
    setIsFinding(true);
    setSuggestedRoutes([]);
    setHighlightedRoute(null);

    // Simulate network delay
    setTimeout(() => {
        const foundRoutes = findSuggestedRoutes({ originId: origin, destinationId: destination, stops, routes, buses });
        setSuggestedRoutes(foundRoutes);
        setIsFinding(false);
        // Highlight the first suggested route by default
        if (foundRoutes.length > 0) {
          setHighlightedRoute(foundRoutes[0].legs[0].route.id);
        }
    }, 1500);
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 md:p-6 min-h-0">
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-6">
          <RouteFinder
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            onFindRoutes={handleFindRoutes}
            isFinding={isFinding}
            stops={stops}
          />
          <RouteSuggestions 
            suggestedRoutes={suggestedRoutes}
            isFinding={isFinding}
            onHoverRoute={setHighlightedRoute}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3 rounded-lg shadow-lg overflow-hidden border">
          <MapDisplay
            buses={buses}
            routes={routes}
            stops={stops}
            highlightedRoute={highlightedRoute}
          />
        </div>
      </main>
      <AiFab />
    </div>
  );
}
