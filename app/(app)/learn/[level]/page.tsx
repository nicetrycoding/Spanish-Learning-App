import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ChevronRight, Circle, PlayCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCourseLevelOverview } from "@/services/content-service";
import { CEFR_LEVELS, CEFR_LABELS, type CEFRLevelKey } from "@/lib/cefr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/state-views";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  return { title: `${level.toUpperCase()} curriculum` };
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const levelKey = level.toUpperCase() as CEFRLevelKey;
  if (!CEFR_LEVELS.includes(levelKey)) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  const overview = await getCourseLevelOverview(levelKey, session.user.id);
  if (!overview) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {levelKey} · {CEFR_LABELS[levelKey]}
        </Badge>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">{overview.title}</h1>
        <p className="mt-1 text-muted-foreground">{overview.description}</p>
      </div>

      {overview.modules.length === 0 ? (
        <EmptyState title="Content coming soon" description="This level's curriculum hasn't been published yet." />
      ) : (
        <div className="space-y-6">
          {overview.modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  {module.isComplete && <Badge variant="success">Complete</Badge>}
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {module.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/learn/lesson/${lesson.slug}`}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.isComplete ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      ) : lesson.completedExercises > 0 ? (
                        <PlayCircle className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <div>
                        <p className={cn("text-sm font-medium", lesson.isComplete && "text-muted-foreground")}>{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.estimatedMinutes} min · {lesson.completedExercises}/{lesson.totalExercises} exercises
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
