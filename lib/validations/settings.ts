import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  region: z.enum(["SPAIN", "MEXICO", "ARGENTINA", "COLOMBIA", "LATAM_GENERAL"]),
  overallLevel: z.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),
  goals: z
    .array(z.enum(["TRAVEL", "WORK", "CONVERSATION", "MOVING", "SCHOOL", "EXAMS", "HOBBIES", "FLUENCY"]))
    .min(1, "Pick at least one goal."),
  dailyGoalMinutes: z.coerce.number().int().refine((v) => [5, 10, 15, 30, 45].includes(v)),
  focusAreas: z
    .array(z.enum(["VOCABULARY", "GRAMMAR", "SPEAKING", "LISTENING", "READING", "WRITING"]))
    .min(1, "Pick at least one focus area."),
  immersionLevel: z.enum(["ENGLISH_ASSISTANCE", "SPANISH_AND_ENGLISH", "SPANISH_MINIMAL_ASSISTANCE", "SPANISH_ONLY"]),
  correctionStyle: z.enum(["after", "immediate"]),
  notificationsEnabled: z.boolean(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
