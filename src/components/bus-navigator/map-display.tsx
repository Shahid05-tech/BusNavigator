"use client";

import type { Bus, BusRoute, Stop } from "@/types";
import { BusIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MapDisplayProps {
  buses: Bus[];
  routes: BusRoute[];
  stops: Stop[];
  highlightedRoute: string | null;
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1000;
const PADDING = 50;

export default function MapDisplay({
  buses,
  routes,
  stops,
  highlightedRoute,
}: MapDisplayProps) {
  const latMin = 0, latMax = 40;
  const lngMin = 0, lngMax = 40;

  const scaleLat = (lat: number) => PADDING + ((lat - latMin) / (latMax - latMin)) * (MAP_HEIGHT - 2 * PADDING);
  const scaleLng = (lng: number) => PADDING + ((lng - lngMin) / (lngMax - lngMin)) * (MAP_WIDTH - 2 * PADDING);

  return (
    <div className="w-full h-full bg-secondary/30 relative overflow-hidden flex items-center justify-center">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-full"
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="transparent" />

        {/* Draw routes */}
        {routes.map((route) => {
          const isHighlighted = route.id === highlightedRoute;
          const points = route.stops
            .map((stopId) => {
              const stop = stops.find((s) => s.id === stopId);
              if (!stop) return null;
              return `${scaleLng(stop.position.lng)},${scaleLat(stop.position.lat)}`;
            })
            .filter(Boolean)
            .join(" ");

          return (
            <polyline
              key={route.id}
              points={points}
              fill="none"
              stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={isHighlighted ? "6" : "3"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Draw stops */}
        {stops.map((stop) => {
          const isOnHighlightedRoute = routes.some(r => r.id === highlightedRoute && r.stops.includes(stop.id));
          return (
            <g key={stop.id} transform={`translate(${scaleLng(stop.position.lng)}, ${scaleLat(stop.position.lat)})`}>
                <circle cx="0" cy="0" r={isOnHighlightedRoute ? "8" : "5"} fill={isOnHighlightedRoute ? "hsl(var(--primary))" : "hsl(var(--foreground))"} className="transition-all duration-300"/>
                <circle cx="0" cy="0" r="12" fill="transparent"/>
                <text x="12" y="4" fontSize="12" fill="hsl(var(--foreground))" className="font-body hidden md:block">
                    {stop.name}
                </text>
            </g>
          );
        })}
        
        {/* Draw buses */}
        {buses.map((bus) => {
          const isHighlighted = bus.routeId === highlightedRoute;
          return (
            <motion.g
              key={bus.id}
              initial={{ x: scaleLng(bus.position.lng), y: scaleLat(bus.position.lat) }}
              animate={{ x: scaleLng(bus.position.lng), y: scaleLat(bus.position.lat) }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ zIndex: isHighlighted ? 20 : 10 }}
            >
              <BusIcon
                x="-12"
                y="-12"
                width="24"
                height="24"
                className="text-accent drop-shadow-lg"
                fill="hsl(var(--accent-foreground))"
                strokeWidth={1.5}
              />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
