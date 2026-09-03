import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getStoriesWithProgress } from "@/services/story-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/state-views";

export const metadata: Metadata = { title: "Stories" };

const REGION_LABEL: Record<string, string> = {
  SPAIN: "Spain",
  MEXICO: "Mexico",
  ARGENTINA: "Argentina",
  COLOMBIA: "Colombia",
  LATAM_GENERAL: "Latin America",
};

export default async function StoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stories = await getStoriesWithProgress(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Interactive stories</h1>
        <p className="mt-1 text-muted-foreground">Branching stories — your choices shape the conversation.</p>
      </div>

      {stories.length === 0 ? (
        <EmptyState title="No stories yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((s) => (
            <Link key={s.id} href={`/stories/${s.slug}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{s.cefrLevel}</Badge>
                    {s.status === "completed" && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {s.status === "in_progress" && <PlayCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{REGION_LABEL[s.region] ?? s.region}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
