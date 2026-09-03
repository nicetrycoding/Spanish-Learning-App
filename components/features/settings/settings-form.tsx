"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { updateSettingsAction } from "@/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CEFR_LEVELS } from "@/lib/cefr";

const REGIONS = [
  { value: "SPAIN", label: "Spain" },
  { value: "MEXICO", label: "Mexico" },
  { value: "ARGENTINA", label: "Argentina" },
  { value: "COLOMBIA", label: "Colombia" },
  { value: "LATAM_GENERAL", label: "General Latin American" },
] as const;

const GOALS = [
  { value: "TRAVEL", label: "Travel" },
  { value: "WORK", label: "Work" },
  { value: "CONVERSATION", label: "Conversation" },
  { value: "MOVING", label: "Moving abroad" },
  { value: "SCHOOL", label: "School" },
  { value: "EXAMS", label: "Exams" },
  { value: "HOBBIES", label: "Hobbies" },
  { value: "FLUENCY", label: "General fluency" },
] as const;

const FOCUS_AREAS = [
  { value: "VOCABULARY", label: "Vocabulary" },
  { value: "GRAMMAR", label: "Grammar" },
  { value: "SPEAKING", label: "Speaking" },
  { value: "LISTENING", label: "Listening" },
  { value: "READING", label: "Reading" },
  { value: "WRITING", label: "Writing" },
] as const;

const IMMERSION_LEVELS = [
  { value: "ENGLISH_ASSISTANCE", label: "English assistance" },
  { value: "SPANISH_AND_ENGLISH", label: "Spanish + English" },
  { value: "SPANISH_MINIMAL_ASSISTANCE", label: "Spanish, minimal assistance" },
  { value: "SPANISH_ONLY", label: "Spanish only" },
] as const;

export function SettingsForm({ defaultValues }: { defaultValues: SettingsInput }) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues });

  const goals = watch("goals");
  const focusAreas = watch("focusAreas");

  function toggleArrayValue<T extends string>(field: "goals" | "focusAreas", value: T, current: T[]) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field, next as never, { shouldDirty: true });
  }

  async function onSubmit(data: SettingsInput) {
    setSaving(true);
    const result = await updateSettingsAction(data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else toast.success("Settings saved");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learning</CardTitle>
          <CardDescription>Level, region, and daily goal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Current level</Label>
              <Controller
                control={control}
                name="overallLevel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CEFR_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Spanish variant</Label>
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Daily goal</Label>
            <Controller
              control={control}
              name="dailyGoalMinutes"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 30, 45].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Goals</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GOALS.map((g) => (
                <label key={g.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={goals?.includes(g.value)}
                    onCheckedChange={() => toggleArrayValue("goals", g.value, goals ?? [])}
                  />
                  {g.label}
                </label>
              ))}
            </div>
            {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Focus areas</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FOCUS_AREAS.map((f) => (
                <label key={f.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={focusAreas?.includes(f.value)}
                    onCheckedChange={() => toggleArrayValue("focusAreas", f.value, focusAreas ?? [])}
                  />
                  {f.label}
                </label>
              ))}
            </div>
            {errors.focusAreas && <p className="text-xs text-destructive">{errors.focusAreas.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Immersion &amp; corrections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>English assistance</Label>
            <Controller
              control={control}
              name="immersionLevel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMMERSION_LEVELS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Correct me immediately in conversations</p>
              <p className="text-xs text-muted-foreground">Default: conversation first, feedback after</p>
            </div>
            <Controller
              control={control}
              name="correctionStyle"
              render={({ field }) => (
                <Switch checked={field.value === "immediate"} onCheckedChange={(c) => field.onChange(c ? "immediate" : "after")} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Daily reminders</p>
              <p className="text-xs text-muted-foreground">Streak, review, and daily-goal reminders</p>
            </div>
            <Controller
              control={control}
              name="notificationsEnabled"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
