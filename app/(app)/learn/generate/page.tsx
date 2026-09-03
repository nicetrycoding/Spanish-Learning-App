import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LessonGeneratorForm } from "@/components/features/lesson-generator/lesson-generator-form";

export const metadata: Metadata = { title: "AI lesson generator" };

export default async function LessonGeneratorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">AI lesson generator</h1>
        <p className="mt-1 text-muted-foreground">Get a custom lesson for exactly the situation you need.</p>
      </div>
      <LessonGeneratorForm />
    </div>
  );
}
