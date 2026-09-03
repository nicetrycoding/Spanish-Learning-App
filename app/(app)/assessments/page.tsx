import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAssessmentHistory } from "@/services/assessment-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/state-views";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Assessments" };

const TYPE_LABEL: Record<string, string> = {
  PLACEMENT: "Placement test",
  LEVEL_COMPLETION: "Level assessment",
  PROGRESS_CHECK: "Progress check",
};

export default async function AssessmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const history = await getAssessmentHistory(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Assessments</h1>
          <p className="mt-1 text-muted-foreground">Track how your level has changed over time.</p>
        </div>
        <Button asChild>
          <Link href="/assessments/new">
            <ClipboardCheck className="h-4 w-4" /> Take assessment
          </Link>
        </Button>
      </div>

      {history.length === 0 ? (
        <EmptyState title="No assessments yet" description="Take an assessment to get a detailed skill breakdown and track progress over time." />
      ) : (
        <div className="space-y-3">
          {history.map((a) => (
            <Link key={a.id} href={`/assessments/${a.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{TYPE_LABEL[a.type] ?? a.type}</p>
                    <p className="text-sm text-muted-foreground">{a.completedAt ? formatDate(a.completedAt) : "In progress"}</p>
                  </div>
                  {a.overallLevel && <Badge>{a.overallLevel}</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
