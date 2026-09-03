"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { saveOnboardingAction } from "@/actions/onboarding-actions";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionCard } from "./option-card";

const LEVEL_OPTIONS: { value: OnboardingInput["selfLevel"]; title: string; description: string }[] = [
  { value: "NOTHING", title: "I know nothing", description: "Never studied Spanish before." },
  { value: "A1", title: "A1", description: "I know a few words and basic phrases." },
  { value: "A2", title: "A2", description: "I can handle simple, everyday exchanges." },
  { value: "B1", title: "B1", description: "I can hold a conversation on familiar topics." },
  { value: "B2", title: "B2", description: "I'm comfortable in most conversations." },
  { value: "C1", title: "C1", description: "I speak fluently with occasional gaps." },
  { value: "C2", title: "C2", description: "I'm near-native." },
  { value: "NOT_SURE", title: "I'm not sure", description: "Take a short placement test to find out." },
];

const GOAL_OPTIONS: { value: OnboardingInput["goals"][number]; title: string }[] = [
  { value: "TRAVEL", title: "Travel" },
  { value: "WORK", title: "Work" },
  { value: "CONVERSATION", title: "Conversation with people I know" },
  { value: "MOVING", title: "Moving to a Spanish-speaking country" },
  { value: "SCHOOL", title: "School" },
  { value: "EXAMS", title: "Exams (DELE, SIELE...)" },
  { value: "HOBBIES", title: "Hobbies (movies, music, books)" },
  { value: "FLUENCY", title: "General fluency" },
];

const TIME_OPTIONS = [5, 10, 15, 30, 45] as const;

const FOCUS_OPTIONS: { value: OnboardingInput["focusAreas"][number]; title: string }[] = [
  { value: "VOCABULARY", title: "Vocabulary" },
  { value: "GRAMMAR", title: "Grammar" },
  { value: "SPEAKING", title: "Speaking" },
  { value: "LISTENING", title: "Listening" },
  { value: "READING", title: "Reading" },
  { value: "WRITING", title: "Writing" },
];

const REGION_OPTIONS: { value: OnboardingInput["region"]; title: string; description: string }[] = [
  { value: "SPAIN", title: "Spain", description: "vosotros, castellano pronunciation" },
  { value: "MEXICO", title: "Mexico", description: "The most widely understood variant" },
  { value: "ARGENTINA", title: "Argentina", description: "voseo, rioplatense pronunciation" },
  { value: "COLOMBIA", title: "Colombia", description: "Clear, neutral pronunciation" },
  { value: "LATAM_GENERAL", title: "General Latin American Spanish", description: "A neutral blend, good default" },
];

type FormState = {
  selfLevel: OnboardingInput["selfLevel"] | null;
  goals: OnboardingInput["goals"];
  dailyGoalMinutes: number | null;
  focusAreas: OnboardingInput["focusAreas"];
  region: OnboardingInput["region"] | null;
};

const STEPS = ["Level", "Goals", "Time", "Focus", "Variant", "Review"] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    selfLevel: null,
    goals: [],
    dailyGoalMinutes: null,
    focusAreas: [],
    region: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleGoal(goal: OnboardingInput["goals"][number]) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal) ? f.goals.filter((g) => g !== goal) : [...f.goals, goal],
    }));
  }

  function toggleFocus(area: OnboardingInput["focusAreas"][number]) {
    setForm((f) => ({
      ...f,
      focusAreas: f.focusAreas.includes(area) ? f.focusAreas.filter((a) => a !== area) : [...f.focusAreas, area],
    }));
  }

  const canAdvance =
    (step === 0 && form.selfLevel !== null) ||
    (step === 1 && form.goals.length > 0) ||
    (step === 2 && form.dailyGoalMinutes !== null) ||
    (step === 3 && form.focusAreas.length > 0) ||
    (step === 4 && form.region !== null) ||
    step === 5;

  function handleSubmit() {
    const parsed = onboardingSchema.safeParse(form);
    if (!parsed.success) {
      setError("Please complete every step before continuing.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveOnboardingAction(parsed.data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.needsPlacement) {
        router.push("/placement-test");
      }
      // Otherwise the server action already redirected to /dashboard.
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif-display text-2xl">{stepTitle(step)}</CardTitle>
          <CardDescription>{stepDescription(step)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {step === 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {LEVEL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.selfLevel === opt.value}
                  onClick={() => setForm((f) => ({ ...f, selfLevel: opt.value }))}
                  title={opt.title}
                  description={opt.description}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {GOAL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.goals.includes(opt.value)}
                  onClick={() => toggleGoal(opt.value)}
                  title={opt.title}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIME_OPTIONS.map((minutes) => (
                <OptionCard
                  key={minutes}
                  selected={form.dailyGoalMinutes === minutes}
                  onClick={() => setForm((f) => ({ ...f, dailyGoalMinutes: minutes }))}
                  title={`${minutes} min`}
                  className="justify-center text-center"
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {FOCUS_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.focusAreas.includes(opt.value)}
                  onClick={() => toggleFocus(opt.value)}
                  title={opt.title}
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {REGION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.region === opt.value}
                  onClick={() => setForm((f) => ({ ...f, region: opt.value }))}
                  title={opt.title}
                  description={opt.description}
                />
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 text-sm">
              <ReviewRow label="Level" value={LEVEL_OPTIONS.find((o) => o.value === form.selfLevel)?.title} />
              <ReviewRow
                label="Goals"
                value={GOAL_OPTIONS.filter((o) => form.goals.includes(o.value)).map((o) => o.title).join(", ")}
              />
              <ReviewRow label="Daily goal" value={form.dailyGoalMinutes ? `${form.dailyGoalMinutes} minutes` : undefined} />
              <ReviewRow
                label="Focus"
                value={FOCUS_OPTIONS.filter((o) => form.focusAreas.includes(o.value)).map((o) => o.title).join(", ")}
              />
              <ReviewRow label="Variant" value={REGION_OPTIONS.find((o) => o.value === form.region)?.title} />
              {form.selfLevel === "NOT_SURE" && (
                <p className="rounded-md bg-accent/10 px-3 py-2 text-accent">
                  Since you're not sure of your level, you'll take a short adaptive placement test next.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || pending}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {form.selfLevel === "NOT_SURE" ? "Continue to placement test" : "Finish setup"}
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

function stepTitle(step: number) {
  return [
    "What's your current level?",
    "What are your goals?",
    "How much time can you study daily?",
    "What do you want to focus on?",
    "Which Spanish do you want to learn?",
    "Review",
  ][step];
}

function stepDescription(step: number) {
  return [
    "Be honest — this just sets your starting point, and it's easy to adjust later.",
    "Select everything that applies.",
    "You can always change this later in Settings.",
    "Select everything that applies.",
    "Regional differences are taught, never marked as errors.",
    "Confirm your choices before we build your learning path.",
  ][step];
}
