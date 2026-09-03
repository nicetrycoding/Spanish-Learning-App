import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RoleplayHub } from "@/components/features/conversation/roleplay-hub";
import { EmptyState } from "@/components/shared/state-views";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [characters, profile] = await Promise.all([
    db.roleplayCharacter.findMany({ orderBy: { difficulty: "asc" } }),
    db.profile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Conversation practice</h1>
        <p className="mt-1 text-muted-foreground">
          Realistic roleplay with a character — the conversation comes first, feedback after.
        </p>
      </div>

      {characters.length === 0 ? (
        <EmptyState title="No characters available yet" />
      ) : (
        <RoleplayHub characters={characters} defaultImmersion={profile?.immersionLevel ?? "SPANISH_AND_ENGLISH"} />
      )}
    </div>
  );
}
