import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PlacementTestRunner } from "@/components/features/placement/placement-test-runner";
import { submitLevelAssessmentAction } from "@/actions/assessment-actions";

export const metadata: Metadata = { title: "New assessment" };

export default async function NewAssessmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="font-serif-display text-2xl font-semibold">Level assessment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Same adaptive format as your placement test — a fresh read on where you stand today.
        </p>
      </div>
      <PlacementTestRunner onSubmit={submitLevelAssessmentAction} />
    </div>
  );
}
