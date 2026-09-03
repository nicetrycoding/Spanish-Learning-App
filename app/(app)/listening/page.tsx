import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { auth } from "@/lib/auth";
import { getListeningExercises } from "@/services/listening-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/state-views";

export const metadata: Metadata = { title: "Listening" };

const SPEED_LABEL: Record<string, string> = { SLOW: "Slow", NORMAL: "Normal", NATURAL: "Natural speed" };
const REGION_LABEL: Record<string, string> = {
  SPAIN: "Spain",
  MEXICO: "Mexico",
  ARGENTINA: "Argentina",
  COLOMBIA: "Colombia",
  LATAM_GENERAL: "Latin America",
};

export default async function ListeningPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exercises = await getListeningExercises();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Listening laboratory</h1>
        <p className="mt-1 text-muted-foreground">Real speech, at real speed, across regions.</p>
      </div>

      {exercises.length === 0 ? (
        <EmptyState icon={Headphones} title="No listening exercises yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {exercises.map((ex) => (
            <Link key={ex.id} href={`/listening/${ex.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{ex.title}</p>
                    <Badge variant="secondary">{ex.cefrLevel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ex.topic}</p>
                  <div className="flex gap-1.5">
                    <Badge variant="outline">{SPEED_LABEL[ex.speed]}</Badge>
                    <Badge variant="outline">{REGION_LABEL[ex.region] ?? ex.region}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
