import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getContentImportHistory } from "@/services/content-import-service";
import { ImportForm } from "@/components/features/import/import-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Learn from real content" };

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const history = await getContentImportHistory(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Learn from real content</h1>
        <p className="mt-1 text-muted-foreground">Bring in an article, transcript, or dialogue and turn it into a mini lesson.</p>
      </div>
      <ImportForm />

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Recent imports</p>
          {history.map((h) => (
            <Link key={h.id} href={`/import/${h.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between py-3 text-sm">
                  <span className="truncate">{h.title}</span>
                  <span className="shrink-0 text-muted-foreground">{formatDate(h.createdAt)}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
