import { z } from "zod";

export const selfLevelOptions = [
  "NOTHING",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "NOT_SURE",
] as const;

export const onboardingSchema = z.object({
  selfLevel: z.enum(selfLevelOptions),
  goals: z
    .array(
      z.enum(["TRAVEL", "WORK", "CONVERSATION", "MOVING", "SCHOOL", "EXAMS", "HOBBIES", "FLUENCY"]),
    )
    .min(1, "Pick at least one goal."),
  dailyGoalMinutes: z.coerce.number().int().refine((v) => [5, 10, 15, 30, 45].includes(v), {
    message: "Pick a valid daily goal.",
  }),
  focusAreas: z
    .array(z.enum(["VOCABULARY", "GRAMMAR", "SPEAKING", "LISTENING", "READING", "WRITING"]))
    .min(1, "Pick at least one focus area."),
  region: z.enum(["SPAIN", "MEXICO", "ARGENTINA", "COLOMBIA", "LATAM_GENERAL"]),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
