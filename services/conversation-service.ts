import "server-only";
import type { SpanishRegion, CEFRLevel, ImmersionLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/service";
import { updateStreakAndXp } from "@/services/progress-service";

const TUTOR_SYSTEM_PROMPT =
  "You are a precise, encouraging Spanish tutor having a text conversation with a student. Answer their question directly and correctly — if they have a misconception, correct it clearly rather than agreeing to be polite. Use examples. When useful, suggest a specific thing to practice next. Keep answers focused, not long lectures.";

export async function startRoleplayConversation(
  userId: string,
  input: { characterId: string; scenario?: string; region: SpanishRegion; difficulty: CEFRLevel; immersionLevel: ImmersionLevel; correctionMode: "after" | "immediate" },
) {
  const character = await db.roleplayCharacter.findUniqueOrThrow({ where: { id: input.characterId } });

  const conversation = await db.conversation.create({
    data: {
      userId,
      kind: "roleplay",
      characterId: character.id,
      scenario: input.scenario ?? character.slug,
      region: input.region,
      difficulty: input.difficulty,
      immersionLevel: input.immersionLevel,
      correctionMode: input.correctionMode,
    },
  });

  const greetingSystem = `${character.systemPromptSeed} You are starting a roleplay conversation set in: ${input.scenario ?? "a casual chat"}. Region/accent flavor: ${input.region}.`;
  const opening = await AIService.generateConversationReply({
    history: [{ role: "user", content: "(The conversation is starting. Greet the student and set the scene in 1-2 sentences.)" }],
    characterSystemPrompt: greetingSystem,
    learner: { level: input.difficulty },
    immersionLevel: input.immersionLevel,
    correctionMode: input.correctionMode,
  });

  await db.conversationMessage.create({
    data: { conversationId: conversation.id, role: "ASSISTANT", content: opening.reply },
  });

  return conversation.id;
}

export async function startTutorConversation(userId: string) {
  const conversation = await db.conversation.create({
    data: { userId, kind: "tutor", region: "LATAM_GENERAL", difficulty: "B1", correctionMode: "immediate" },
  });
  await db.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: "¡Hola! I'm your Spanish tutor. Ask me anything — grammar, word choice, why something sounds off. What's on your mind?",
    },
  });
  return conversation.id;
}

export async function getConversation(userId: string, conversationId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } }, character: true },
  });
  if (!conversation || conversation.userId !== userId) return null;
  return conversation;
}

export async function sendConversationMessage(userId: string, conversationId: string, text: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } }, character: true },
  });
  if (!conversation || conversation.userId !== userId) throw new Error("Forbidden");

  await db.conversationMessage.create({ data: { conversationId, role: "USER", content: text } });

  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const level = skillProfile?.overallLevel ?? conversation.difficulty;

  const history = [...conversation.messages, { role: "USER" as const, content: text }].map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  const systemPrompt =
    conversation.kind === "tutor"
      ? TUTOR_SYSTEM_PROMPT
      : `${conversation.character?.systemPromptSeed ?? "You are a friendly Spanish conversation partner."} Scenario: ${conversation.scenario}. Region: ${conversation.region}.`;

  const result = await AIService.generateConversationReply({
    history,
    characterSystemPrompt: systemPrompt,
    learner: { level },
    immersionLevel: conversation.immersionLevel,
    correctionMode: conversation.correctionMode as "after" | "immediate",
  });

  await db.conversationMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content: result.reply,
      corrections: result.corrections ? (result.corrections as unknown as object) : undefined,
    },
  });

  await updateStreakAndXp(userId, 3, {});

  return result;
}

/** Generates end-of-conversation feedback: a friendly wrap-up plus any accumulated corrections, and closes the session. */
export async function endConversation(userId: string, conversationId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: true },
  });
  if (!conversation || conversation.userId !== userId) throw new Error("Forbidden");

  await db.conversation.update({ where: { id: conversationId }, data: { endedAt: new Date() } });
  await updateStreakAndXp(userId, 15, { studyMinutes: 5 });

  const corrections = conversation.messages
    .filter((m) => m.corrections)
    .flatMap((m) => m.corrections as unknown as { original: string; corrected: string; explanation: string }[]);

  return { corrections, messageCount: conversation.messages.length };
}
