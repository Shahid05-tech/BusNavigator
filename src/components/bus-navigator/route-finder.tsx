"use client";

import type { Stop } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Waypoints, LoaderCircle, LocateFixed } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getDistance } from "@/lib/utils";
import { useState } from "react";

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
  const { toast } = useToast();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services.",
      });
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPosition = { lat: latitude, lng: longitude };

        let closestStop: Stop | null = null;
        let minDistance = Infinity;

        stops.forEach((stop) => {
          const distance = getDistance(userPosition, stop.position);
          if (distance < minDistance) {
            minDistance = distance;
            closestStop = stop;
          }
        });

        if (closestStop) {
          setOrigin(closestStop.id);
          toast({
            title: "Location Detected",
            description: `Nearest stop found: ${closestStop.name}`,
          });
        }
        setIsDetectingLocation(false);
      },
      (error) => {
        let description = "An unknown error occurred.";
        if (error.code === error.PERMISSION_DENIED) {
          description = "Please allow location access to use this feature.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          description = "Location information is unavailable.";
        }
        toast({
          variant: "destructive",
          title: "Could Not Detect Location",
          description: description,
        });
        setIsDetectingLocation(false);
      }
    );
  };

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
          <div className="flex items-center gap-2">
            <Select onValueChange={setOrigin} value={origin}>
              <SelectTrigger id="origin" className="w-full">
                <SelectValue placeholder="Select a starting point" />
              </SelectTrigger>
              <SelectContent>
                {stops.map((stop) => (
                  <SelectItem key={stop.id} value={stop.id}>
                    {stop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              aria-label="Detect current location"
            >
              {isDetectingLocation ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <LocateFixed className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">To</Label>
          <Select onValueChange={setDestination} value={destination}>
            <SelectTrigger id="destination" className="w-full">
              <SelectValue placeholder="Select a destination" />
            </SelectTrigger>
            <SelectContent>
              {stops.map((stop) => (
                <SelectItem key={stop.id} value={stop.id}>
                  {stop.name}
                </SelectItem>
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
