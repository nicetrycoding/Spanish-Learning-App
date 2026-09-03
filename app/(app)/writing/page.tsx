import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { WritingHub } from "@/components/features/writing/writing-hub";

export const metadata: Metadata = { title: "Writing" };

export default async function WritingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Writing laboratory</h1>
        <p className="mt-1 text-muted-foreground">Pick a prompt at your level and get detailed, honest feedback.</p>
      </div>
      <WritingHub />
    </div>
  );
}
