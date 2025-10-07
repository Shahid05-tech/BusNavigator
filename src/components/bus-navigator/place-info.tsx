
"use client";

import { useState } from 'react';
import { getPlaceInfo } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PlaceInfoProps {
    placeName: string;
}

export default function PlaceInfo({ placeName }: PlaceInfoProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [info, setInfo] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGetInfo = async () => {
        setIsLoading(true);
        setInfo(null);
        try {
            const result = await getPlaceInfo({ placeName });
            setInfo(result.information);
        } catch (error) {
            console.error("AI place info failed:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not get information about this place.",
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-3 space-y-3">
            {!info && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={handleGetInfo}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Discovering...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4 text-accent" />
                            Learn about {placeName}
                        </>
                    )}
                </Button>
            )}
            
            {info && (
                <div className="text-sm text-foreground/80 p-3 bg-secondary rounded-md">
                    <p>{info}</p>
                </div>
            )}
        </div>
    );
}
