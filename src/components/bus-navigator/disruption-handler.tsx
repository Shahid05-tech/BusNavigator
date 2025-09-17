"use client";

import { useState } from 'react';
import { suggestAlternativeRoutes } from '@/app/actions';
import type { AlternativeRoutesOutput } from '@/ai/flows/dynamic-rerouting-on-disruptions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, TriangleAlert, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"


interface DisruptionHandlerProps {
    currentLocation: string;
    destination: string;
    plannedRoute: string;
}

export default function DisruptionHandler({ currentLocation, destination, plannedRoute }: DisruptionHandlerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<AlternativeRoutesOutput | null>(null);
    const { toast } = useToast();

    const handleDisruption = async () => {
        setIsLoading(true);
        setSuggestion(null);
        try {
            const result = await suggestAlternativeRoutes({
                currentLocation,
                destination,
                plannedRoute,
                disruptionDetails: "User reported heavy traffic and potential accident.",
            });
            setSuggestion(result);
        } catch (error) {
            console.error("AI suggestion failed:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not get alternative route suggestions.",
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-3 space-y-3">
            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleDisruption}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Getting AI Help...
                    </>
                ) : (
                    <>
                        <TriangleAlert className="mr-2 h-4 w-4 text-destructive" />
                        Report Disruption
                    </>
                )}
            </Button>
            
            {suggestion && (
                <Alert variant="default" className="bg-primary/10 border-primary/50">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <AlertTitle className="font-headline text-primary">AI Re-routing Suggestion</AlertTitle>
                    <AlertDescription className="space-y-2 text-foreground">
                        <p className="font-semibold">{suggestion.reasoning}</p>
                        <ul className="list-disc pl-5 space-y-1">
                            {suggestion.alternativeRouteSuggestions.map((route, i) => (
                                <li key={i}>{route} (Est. Arrival: {suggestion.estimatedArrivalTimes[i]})</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
