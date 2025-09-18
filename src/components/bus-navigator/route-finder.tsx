"use client";

import type { Stop } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Waypoints, LoaderCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RouteFinderProps {
  origin: string;
  setOrigin: (id: string) => void;
  destination: string;
  setDestination: (id: string) => void;
  onFindRoutes: () => void;
  isFinding: boolean;
  stops: Stop[];
}

export default function RouteFinder({
  origin,
  setOrigin,
  destination,
  setDestination,
  onFindRoutes,
  isFinding,
  stops,
}: RouteFinderProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Waypoints className="text-primary" />
          Find Your Route
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="origin">From</Label>
          <Select onValueChange={setOrigin} value={origin}>
            <SelectTrigger id="origin" className="w-full">
              <SelectValue placeholder="Select a starting point" />
            </SelectTrigger>
            <SelectContent>
              {stops.map(stop => (
                <SelectItem key={stop.id} value={stop.id}>{stop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">To</Label>
           <Select onValueChange={setDestination} value={destination}>
            <SelectTrigger id="destination" className="w-full">
              <SelectValue placeholder="Select a destination" />
            </SelectTrigger>
            <SelectContent>
              {stops.map(stop => (
                <SelectItem key={stop.id} value={stop.id}>{stop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={onFindRoutes}
          disabled={isFinding || !origin || !destination}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
        >
          {isFinding ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Find Bus"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
