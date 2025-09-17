import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Using a simplified equirectangular approximation, which is fine for this simulated grid.
export function getDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
) {
  const dx = pos1.lng - pos2.lng;
  const dy = pos1.lat - pos2.lat;
  return Math.sqrt(dx * dx + dy * dy);
}
