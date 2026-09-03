"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

export interface SettingsActionState {
  success?: boolean;
  error?: string;
}

export async function updateSettingsAction(input: SettingsInput): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form for errors." };
  const data = parsed.data;
  const userId = session.user.id;

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { name: data.name } });

    await tx.profile.update({
      where: { userId },
      data: {
        region: data.region,
        dailyGoalMinutes: data.dailyGoalMinutes,
        focusAreas: data.focusAreas,
        immersionLevel: data.immersionLevel,
        correctionStyle: data.correctionStyle,
        notificationsEnabled: data.notificationsEnabled,
      },
    });

    await tx.userLearningGoal.deleteMany({ where: { userId } });
    await tx.userLearningGoal.createMany({ data: data.goals.map((goal) => ({ userId, goal })) });

    const current = await tx.skillProfile.findUnique({ where: { userId } });
    if (current && current.overallLevel !== data.overallLevel) {
      await tx.skillProfile.update({
        where: { userId },
        data: {
          overallLevel: data.overallLevel,
          grammarLevel: data.overallLevel,
          vocabularyLevel: data.overallLevel,
          readingLevel: data.overallLevel,
          listeningLevel: data.overallLevel,
          writingLevel: data.overallLevel,
          speakingLevel: data.overallLevel,
          overallSub: 0,
          grammarSub: 0,
          vocabularySub: 0,
          readingSub: 0,
          listeningSub: 0,
          writingSub: 0,
          speakingSub: 0,
        },
      });
      await tx.userLevel.create({ data: { userId, level: data.overallLevel, subLevel: 0, source: "manual_override" } });
    }
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
