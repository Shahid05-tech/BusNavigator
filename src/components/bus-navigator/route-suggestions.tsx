"use client";

import type { SuggestedRoute } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bus, MoreVertical, Route, Clock, AlertCircle, ArrowRight, Info } from "lucide-react";
import DisruptionHandler from "./disruption-handler";


interface RouteSuggestionsProps {
    suggestedRoutes: SuggestedRoute[];
    isFinding: boolean;
    onHoverRoute: (routeId: string | null) => void;
}

export default function RouteSuggestions({ suggestedRoutes, isFinding, onHoverRoute }: RouteSuggestionsProps) {
    if (isFinding) {
        return (
            <Card className="flex-1 shadow-lg">
                <CardHeader><CardTitle className="font-headline">Suggested Routes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (suggestedRoutes.length === 0) {
        return (
            <Card className="flex-1 shadow-lg">
                <CardHeader><CardTitle className="font-headline">Suggested Routes</CardTitle></CardHeader>
                <CardContent>
                    <Alert variant="default" className="bg-secondary">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No routes found</AlertTitle>
                        <AlertDescription>
                            Enter your start and end points to see route suggestions.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex-1 shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="font-headline">Suggested Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestedRoutes.map((sRoute, index) => (
                    <div 
                        key={index} 
                        className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                        onMouseEnter={() => onHoverRoute(sRoute.legs[0].route.id)}
                        onMouseLeave={() => onHoverRoute(null)}
                    >
                        {sRoute.type === 'direct' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <Bus size={20}/>
                                        <span className="font-headline">{sRoute.legs[0].bus.name}</span>
                                    </div>
                                    {sRoute.legs[0].eta > 0 &&
                                        <span className="text-sm font-bold text-accent">{sRoute.legs[0].eta} min</span>
                                    }
                                </div>
                                <div className="text-sm space-y-1">
                                    <p className="flex items-center gap-2"><Route size={16} className="text-muted-foreground"/> {sRoute.legs[0].route.name}</p>
                                    {sRoute.legs[0].eta > 0 ? (
                                        <p className="flex items-center gap-2"><Clock size={16} className="text-muted-foreground"/> Arrives in ~{sRoute.legs[0].eta} min</p>
                                    ) : (
                                        <p className="flex items-center gap-2 text-muted-foreground"><Info size={16}/> On route, no direct ETA</p>
                                    )}
                                </div>
                                <DisruptionHandler
                                    currentLocation={sRoute.legs[0].startStop.name}
                                    destination={sRoute.legs[0].endStop.name}
                                    plannedRoute={sRoute.legs[0].route.name}
                                />
                            </div>
                        )}
                        {sRoute.type === 'connecting' && (
                             <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <Bus size={20}/>
                                        <span className="font-headline">Connecting Route</span>
                                    </div>
                                    <span className="text-sm font-bold text-accent">{sRoute.legs.reduce((acc, leg) => acc + leg.eta, 0)} min</span>
                                </div>
                                {sRoute.legs.map((leg, legIndex) => (
                                    <div key={legIndex} className="pl-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <div className="flex flex-col items-center mr-2">
                                                <Bus size={16} className="text-primary mt-1"/>
                                                {legIndex < sRoute.legs.length -1 && <div className="h-8 w-px bg-border my-1" />}
                                            </div>
                                            <div>
                                                <p>Take <span className="font-semibold">{leg.route.name}</span> from <span className="font-semibold">{leg.startStop.name}</span></p>
                                                <p className="text-muted-foreground">Arrives in ~{leg.eta} min</p>
                                            </div>
                                        </div>
                                         {legIndex < sRoute.legs.length - 1 && (
                                            <div className="flex items-center gap-2 text-sm ml-1 my-2">
                                                <ArrowRight size={16} className="text-accent ml-0.5" />
                                                <p className="ml-1">Change at <span className="font-semibold">{leg.endStop.name}</span></p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
