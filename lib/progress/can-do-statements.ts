import type { CEFRLevelKey } from "@/lib/cefr";

/** CEFR-grounded "can-do" statements, adapted from the Council of Europe self-assessment grid — used to show competence, not just content completion. */
export const CAN_DO_STATEMENTS: { level: CEFRLevelKey; statement: string }[] = [
  { level: "A1", statement: "Can introduce yourself and answer basic personal questions" },
  { level: "A1", statement: "Can order food and drinks in a restaurant" },
  { level: "A1", statement: "Can understand slow, clearly-spoken conversations about familiar topics" },
  { level: "A2", statement: "Can describe your daily routine and past events in simple terms" },
  { level: "A2", statement: "Can handle simple transactions while shopping or traveling" },
  { level: "A2", statement: "Can understand the main point of short, clear messages" },
  { level: "B1", statement: "Can describe past events and narrate a simple story" },
  { level: "B1", statement: "Can discuss familiar topics and express opinions" },
  { level: "B1", statement: "Can handle most situations while traveling in a Spanish-speaking area" },
  { level: "B2", statement: "Can handle spontaneous conversation with native speakers fairly fluently" },
  { level: "B2", statement: "Can write clear, detailed text on a range of subjects" },
  { level: "B2", statement: "Can understand the main ideas of complex text on concrete and abstract topics" },
  { level: "C1", statement: "Can argue complex ideas and express nuanced opinions" },
  { level: "C1", statement: "Can use language flexibly for social, academic, and professional purposes" },
  { level: "C1", statement: "Can understand a wide range of demanding, longer texts" },
  { level: "C2", statement: "Can understand virtually everything heard or read with ease" },
  { level: "C2", statement: "Can express yourself spontaneously with precise shades of meaning" },
  { level: "C2", statement: "Can differentiate finer shades of meaning in complex situations" },
];

export type CanDoStatus = "done" | "in_progress" | "upcoming";

export function statementsWithStatus(overallLevel: CEFRLevelKey, overallSub: number) {
  const CEFR_LEVELS: CEFRLevelKey[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const currentIdx = CEFR_LEVELS.indexOf(overallLevel);

  return CAN_DO_STATEMENTS.map((s) => {
    const statementIdx = CEFR_LEVELS.indexOf(s.level);
    let status: CanDoStatus;
    if (statementIdx < currentIdx) status = "done";
    else if (statementIdx === currentIdx) status = overallSub >= 0.5 ? "done" : "in_progress";
    else status = "upcoming";
    return { ...s, status };
  });
}
