import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Ear,
  MessagesSquare,
  Mic,
  NotebookPen,
  Radar,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CEFR_LABELS, CEFR_LEVELS, LEVEL_COLOR_VAR } from "@/lib/cefr";

const loopSteps = [
  { label: "Diagnose", detail: "Adaptive placement test pinpoints what you already know." },
  { label: "Learn", detail: "Bite-sized lessons matched to your exact level." },
  { label: "Practice", detail: "Sixteen exercise types, never just multiple choice." },
  { label: "Measure", detail: "Every answer updates five mastery signals, not just a score." },
  { label: "Adapt", detail: "Weak spots resurface automatically; strengths get harder." },
  { label: "Review", detail: "Spaced repetition schedules what's about to be forgotten." },
];

const features = [
  {
    icon: Radar,
    title: "Adaptive curriculum",
    body: "The platform tracks Grammar, Vocabulary, Reading, Listening, Writing, and Speaking as six independent skills — each with its own CEFR sub-level — and routes you to whichever one needs attention.",
  },
  {
    icon: NotebookPen,
    title: "Mistake intelligence",
    body: "Every mistake is categorized, explained at your level, and — if it keeps happening — turned into targeted practice automatically.",
  },
  {
    icon: MessagesSquare,
    title: "AI tutor & roleplay",
    body: "Ask \"why fui and not era?\" and get a real answer. Or practice a job interview in Mexican Spanish with a character who corrects you like a person, not a grammar checker.",
  },
  {
    icon: Ear,
    title: "Listening laboratory",
    body: "Slow, normal, and natural speech across regional accents. Missed expressions get queued for review automatically.",
  },
  {
    icon: Mic,
    title: "Speaking & shadowing",
    body: "Record, compare against native rhythm, retry. Pronunciation feedback that goes beyond \"try again.\"",
  },
  {
    icon: BookOpenText,
    title: "Real, regional Spanish",
    body: "vosotros habláis in Spain, ustedes hablan in Mexico, vos hablás in Argentina — regional variation is taught, never marked wrong.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, var(--primary), transparent 40%), radial-gradient(circle at 85% 10%, var(--accent), transparent 35%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" /> Adaptive · not one-size-fits-all
            </Badge>
            <h1 className="font-serif-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Learn Spanish the way you'd actually learn a language
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
              Sendero diagnoses exactly what you know — down to the sub-skill — then builds a
              curriculum around it. Absolute beginner or already conversational, the platform
              meets you where you are and never wastes your time.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?path=beginner">
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/signup?path=placement">I Already Know Spanish</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to start · No credit card · Placement test takes about 10 minutes
            </p>
          </div>
        </div>
      </section>

      {/* CEFR ladder */}
      <section id="curriculum" className="border-y border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-serif-display text-2xl font-semibold sm:text-3xl">
              Zero to native-level nuance
            </h2>
            <p className="mt-3 text-muted-foreground">
              Seven levels on the CEFR scale, each broken into modules that go far beyond
              vocabulary lists — by C1 you're learning register, irony, and argumentation, not
              harder flashcards.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {CEFR_LEVELS.map((level) => (
              <div
                key={level}
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div
                  className="mb-3 h-1.5 w-8 rounded-full"
                  style={{ background: LEVEL_COLOR_VAR[level] }}
                />
                <p className="font-serif-display text-xl font-semibold">{level}</p>
                <p className="mt-1 text-xs text-muted-foreground">{CEFR_LABELS[level]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The loop */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-serif-display text-2xl font-semibold sm:text-3xl">
            One continuous loop, not a pile of features
          </h2>
          <p className="mt-3 text-muted-foreground">
            A vocabulary tab and a grammar tab don't make a curriculum. Everything you do feeds
            back into what the system recommends next.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loopSteps.map((step, i) => (
            <Card key={step.label} className="relative">
              <CardContent className="pt-6">
                <span className="font-serif-display text-3xl text-primary/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-semibold">{step.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* For two kinds of learner */}
      <section className="border-y border-border/70 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <Badge className="mb-4">Starting from zero</Badge>
                <h3 className="font-serif-display text-xl font-semibold">Never studied Spanish?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explanations in English, extremely gradual pacing, and pronunciation support from
                  lesson one. You'll say your first full sentence — <em>"Me llamo Alex y soy de
                  Canadá"</em> — before you even notice you've started producing language.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-accent/20">
              <CardContent className="pt-6">
                <Badge variant="accent" className="mb-4">Already know Spanish</Badge>
                <h3 className="font-serif-display text-xl font-semibold">
                  Conversational but plateaued?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Skip straight to subjunctive nuance, regional slang, and debate practice. The
                  placement test estimates separate levels for grammar, listening, writing, and
                  speaking — so you're never re-doing material you've outgrown.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-serif-display text-2xl font-semibold sm:text-3xl">
            Every part of the language, connected
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <Card className="overflow-hidden bg-foreground text-background">
          <CardContent className="flex flex-col items-center gap-6 py-14 text-center">
            <Target className="h-8 w-8" />
            <h2 className="font-serif-display text-2xl font-semibold sm:text-3xl">
              Know exactly what to study today
            </h2>
            <p className="max-w-md text-sm text-background/80">
              No more guessing. Start with a diagnosis, get a plan, and let the system tell you
              what's next — every single day.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">
                Start Learning <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
