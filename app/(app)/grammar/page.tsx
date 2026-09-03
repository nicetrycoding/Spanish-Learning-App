import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getGrammarTopicsByLevel } from "@/services/grammar-service";
import { CEFR_LABELS, type CEFRLevelKey } from "@/lib/cefr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/state-views";

export const metadata: Metadata = { title: "Grammar" };

export default async function GrammarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const groups = await getGrammarTopicsByLevel(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Grammar</h1>
        <p className="mt-1 text-muted-foreground">Every topic, organized by CEFR level. Jump to any topic directly.</p>
      </div>

      {groups.length === 0 ? (
        <EmptyState title="No grammar topics yet" />
      ) : (
        groups.map((group) => (
          <div key={group.level}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Badge variant="secondary">{group.level}</Badge>
              {CEFR_LABELS[group.level as CEFRLevelKey]}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.topics.map((topic) => (
                <Link key={topic.id} href={`/grammar/${topic.slug}`}>
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="space-y-2 py-4">
                      <p className="font-medium">{topic.title}</p>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{topic.summary}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={topic.mastery} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{Math.round(topic.mastery)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
