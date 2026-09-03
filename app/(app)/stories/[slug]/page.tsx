import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getStoryRunnerData } from "@/services/story-service";
import { StoryRunner } from "@/components/features/stories/story-runner";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getStoryRunnerData(slug, session.user.id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <StoryRunner
        storyId={data.story.id}
        title={data.story.title}
        initialStepKey={data.progress.currentStepKey}
        steps={data.story.steps.map((s) => ({
          stepKey: s.stepKey,
          speaker: s.speaker,
          textEs: s.textEs,
          textEn: s.textEn,
          choices: s.choices as { label: string; nextStepKey: string }[],
          isEnding: s.isEnding,
          vocabHighlights: s.vocabHighlights as { es: string; en: string }[],
        }))}
      />
    </div>
  );
}
