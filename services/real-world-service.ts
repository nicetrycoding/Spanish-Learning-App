import "server-only";
import { db } from "@/lib/db";
import { REAL_WORLD_SCENARIOS } from "@/lib/real-world/scenarios";

export async function getRealWorldScenarioLinks() {
  const [characters, listeningExercises] = await Promise.all([
    db.roleplayCharacter.findMany(),
    db.listeningExercise.findMany({ select: { id: true, topic: true } }),
  ]);

  return Promise.all(
    REAL_WORLD_SCENARIOS.map(async (scenario) => {
      const character = characters.find(
        (c) => c.slug.includes(scenario.slug) || c.systemPromptSeed.toLowerCase().includes(scenario.tag),
      );
      const listening = listeningExercises.find((l) => l.topic.toLowerCase().includes(scenario.tag));
      const vocabCount = await db.vocabulary.count({ where: { tags: { has: scenario.tag } } });
      return { ...scenario, characterId: character?.id, listeningId: listening?.id, vocabCount };
    }),
  );
}
