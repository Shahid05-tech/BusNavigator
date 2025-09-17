import { Bus } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center h-16 px-6 bg-card border-b shadow-sm z-10">
      <Bus className="h-7 w-7 text-primary" />
      <h1 className="ml-3 text-2xl font-semibold font-headline text-foreground">
        Bus Navigator
      </h1>
    </header>
  );
}
