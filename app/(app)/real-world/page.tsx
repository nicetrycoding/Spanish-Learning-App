import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Headphones, MessagesSquare, Library } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRealWorldScenarioLinks } from "@/services/real-world-service";
import { startRoleplayAction } from "@/actions/conversation-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Real-world Spanish" };

export default async function RealWorldPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const scenarios = await getRealWorldScenarioLinks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Real-world Spanish</h1>
        <p className="mt-1 text-muted-foreground">Vocabulary, listening, and conversation for situations you'll actually be in.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((s) => (
          <Card key={s.slug}>
            <CardHeader>
              <span className="text-2xl">{s.emoji}</span>
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {s.characterId ? (
                <form
                  action={startRoleplayAction.bind(null, {
                    characterId: s.characterId,
                    scenario: s.title,
                    region: "LATAM_GENERAL",
                    difficulty: "A2",
                    immersionLevel: "SPANISH_AND_ENGLISH",
                    correctionMode: "after",
                  })}
                >
                  <Button type="submit" size="sm" variant="outline">
                    <MessagesSquare className="h-3.5 w-3.5" /> Practice conversation
                  </Button>
                </form>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href="/conversation">
                    <MessagesSquare className="h-3.5 w-3.5" /> Conversation
                  </Link>
                </Button>
              )}
              {s.listeningId && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/listening/${s.listeningId}`}>
                    <Headphones className="h-3.5 w-3.5" /> Listen
                  </Link>
                </Button>
              )}
              {s.vocabCount > 0 && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/vocabulary?tag=${s.tag}`}>
                    <Library className="h-3.5 w-3.5" /> Vocabulary ({s.vocabCount})
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
