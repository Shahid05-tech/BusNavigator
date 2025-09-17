"use client";

import type { Stop } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waypoints, LoaderCircle } from "lucide-react";

interface RouteFinderProps {
  origin: string;
  setOrigin: (id: string) => void;
  destination: string;
  setDestination: (id: string) => void;
  onFindRoutes: () => void;
  isFinding: boolean;
  stops: Stop[];
}

const AutocompleteInput = ({
  value,
  setValue,
  id,
  placeholder,
  stops,
}: {
  value: string;
  setValue: (id: string) => void;
  id: string;
  placeholder: string;
  stops: Stop[];
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    if (text.length > 1) {
      setSuggestions(
        stops.filter((stop) =>
          stop.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const selectStop = (stop: Stop) => {
    setValue(stop.id);
    setInputValue(stop.name);
    setSuggestions([]);
    setIsFocused(false);
  };
  
  const currentStopName = stops.find(s => s.id === value)?.name || inputValue;

  return (
    <div className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={currentStopName}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="bg-background"
        autoComplete="off"
      />
      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((stop) => (
            <div
              key={stop.id}
              className="px-4 py-2 cursor-pointer hover:bg-secondary"
              onMouseDown={() => selectStop(stop)}
            >
              {stop.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


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
          <AutocompleteInput
            id="origin"
            value={origin}
            setValue={setOrigin}
            placeholder="e.g., Central Station"
            stops={stops}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">To</Label>
          <AutocompleteInput
            id="destination"
            value={destination}
            setValue={setDestination}
            placeholder="e.g., Westside Mall"
            stops={stops}
          />
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
