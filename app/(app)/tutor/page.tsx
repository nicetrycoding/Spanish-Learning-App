import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startTutorAction } from "@/actions/conversation-actions";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Tutor" };

export default async function TutorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const recent = await db.conversation.findMany({
    where: { userId: session.user.id, kind: "tutor" },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif-display text-2xl font-semibold">Ask the AI Tutor</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              "Why is 'fui' used here instead of 'era'?" — ask anything about grammar, vocabulary, or usage.
            </p>
          </div>
          <form action={startTutorAction}>
            <Button type="submit" size="lg">
              New question
            </Button>
          </form>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Recent</p>
          {recent.map((c) => (
            <Link key={c.id} href={`/tutor/${c.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between py-3 text-sm">
                  <span>Conversation</span>
                  <span className="text-muted-foreground">{formatDate(c.startedAt)}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
