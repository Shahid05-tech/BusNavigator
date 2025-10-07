import { Bus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b shadow-sm z-10">
      <Link href="/" className="flex items-center gap-3">
        <Bus className="h-7 w-7 text-primary" />
        <h1 className="ml-3 text-2xl font-semibold font-headline text-foreground">
          Bus Navigator
        </h1>
      </Link>
      <nav>
        <Button asChild variant="ghost" size="icon" aria-label="AI Assistant">
          <Link href="/blog">
            <Sparkles className="h-6 w-6 text-primary" />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
