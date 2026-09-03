import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
      <div className="rounded-full bg-secondary p-4">
        <WifiOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h1 className="font-serif-display text-xl font-semibold">You're offline</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          This page hasn't been saved for offline use yet. Pages you've already visited — lessons, vocabulary,
          grammar topics — stay available without a connection.
        </p>
      </div>
    </div>
  );
}
