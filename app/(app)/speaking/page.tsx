import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { SpeakingHub } from "@/components/features/speaking/speaking-hub";

export const metadata: Metadata = { title: "Speaking" };

export default async function SpeakingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Speaking practice</h1>
        <p className="mt-1 text-muted-foreground">Record yourself and get feedback on pronunciation, fluency, and grammar.</p>
      </div>
      <SpeakingHub />
    </div>
  );
}
