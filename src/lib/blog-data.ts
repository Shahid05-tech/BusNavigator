
export interface BlogPost {
    id: string;
    title: string;
    date: string;
    content: string[];
}

export const blogContent: BlogPost[] = [
    {
        id: "real-time-tracking",
        title: "Never Miss a Bus Again with Real-Time Tracking",
        date: "September 24, 2025",
        content: [
            "One of the biggest challenges for public transport users is uncertainty. Is the bus on time, early, or late? Our core feature at Bus Navigator is live, real-time GPS tracking for every bus on our network. You can open the map and see exactly where your bus is at any given moment.",
            "This feature is powered by frequent updates from each bus's onboard GPS unit, which are then streamed to your device. This means the bus icons you see on the map aren't just an estimate; they represent the actual location of the bus, helping you plan your journey down to the minute."
        ]
    },
    {
        id: "ai-rerouting",
        title: "How AI Helps You Navigate Disruptions",
        date: "September 22, 2025",
        content: [
            "Traffic jams, accidents, and unexpected road closures are an unfortunate part of city life. In the past, a disruption meant a long, frustrating wait. With Bus Navigator, we've turned this problem over to our powerful AI assistant, powered by Google's Gemini model.",
            "When you report a disruption, our AI gets to work. It analyzes your current location, your final destination, and the nature of the disruption. Instead of just suggesting the next bus, it looks at the entire network to find intelligent alternative routes, including connections you might not have considered. It provides you with a new plan, complete with estimated arrival times, so you can make an informed decision and get back on your way."
        ]
    },
    {
        id: "location-detection",
        title: "Find Your Nearest Stop with a Single Tap",
        date: "September 20, 2025",
        content: [
            "When you're in an unfamiliar part of town, finding the right bus stop can be a challenge. That's why we built the 'Detect My Location' feature. With a single tap, Bus Navigator uses your device's geolocation to instantly identify the closest bus stop to you.",
            "It then automatically populates the 'From' field in our route finder, making your journey planning faster and more seamless than ever. This feature relies on your browser's built-in location services and compares your real-world coordinates against our comprehensive database of bus stop locations to ensure accuracy."
        ]
    }
];

// Function to get all blog content as a single string for the RAG prompt
export function getBlogContentAsText(): string {
    return blogContent.map(post => `Title: ${post.title}\nContent: ${post.content.join(' ')}`).join('\n\n---\n\n');
}
