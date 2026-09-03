import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getDueReviewQueue } from "@/services/review-service";
import { ReviewRunner } from "@/components/features/review/review-runner";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cards = await getDueReviewQueue(session.user.id, 20);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold">Review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prioritized by what you're most likely to forget — not random.
        </p>
      </div>
      <ReviewRunner cards={cards} />
    </div>
  );
}
