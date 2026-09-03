import type { CEFRLevelKey } from "@/lib/cefr";

export interface WritingPrompt {
  id: string;
  level: CEFRLevelKey;
  promptEs: string;
  promptEn: string;
  minWords: number;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  { id: "w-a1-family", level: "A1", promptEs: "Describe a tu familia.", promptEn: "Describe your family.", minWords: 20 },
  { id: "w-a1-day", level: "A1", promptEs: "Describe un día típico en tu vida.", promptEn: "Describe a typical day in your life.", minWords: 25 },
  { id: "w-a2-trip", level: "A2", promptEs: "Cuenta un viaje que hiciste el año pasado.", promptEn: "Tell about a trip you took last year.", minWords: 40 },
  { id: "w-a2-friend", level: "A2", promptEs: "Describe a tu mejor amigo/a y por qué es importante para ti.", promptEn: "Describe your best friend and why they matter to you.", minWords: 40 },
  { id: "w-b1-email", level: "B1", promptEs: "Escribe un correo a tu jefe pidiendo unos días de vacaciones.", promptEn: "Write an email to your manager asking for a few days of vacation.", minWords: 60 },
  { id: "w-b1-opinion", level: "B1", promptEs: "¿Prefieres vivir en la ciudad o en el campo? Explica por qué.", promptEn: "Do you prefer living in the city or the countryside? Explain why.", minWords: 60 },
  { id: "w-b2-remote", level: "B2", promptEs: "¿El teletrabajo mejora la productividad? Argumenta tu postura.", promptEn: "Does remote work improve productivity? Argue your position.", minWords: 100 },
  { id: "w-b2-complaint", level: "B2", promptEs: "Escribe una carta formal de reclamación sobre un producto defectuoso.", promptEn: "Write a formal complaint letter about a defective product.", minWords: 100 },
  { id: "w-c1-tech", level: "C1", promptEs: "Analiza el impacto de la inteligencia artificial en el mercado laboral.", promptEn: "Analyze the impact of artificial intelligence on the job market.", minWords: 150 },
  { id: "w-c1-debate", level: "C1", promptEs: "¿Deberían las ciudades prohibir los coches privados en el centro? Defiende tu postura con argumentos sólidos.", promptEn: "Should cities ban private cars from downtown areas? Defend your position with solid arguments.", minWords: 150 },
  { id: "w-c2-essay", level: "C2", promptEs: "Escribe un ensayo sobre cómo el lenguaje moldea el pensamiento, citando ejemplos concretos.", promptEn: "Write an essay on how language shapes thought, citing concrete examples.", minWords: 200 },
];

export function writingPromptsByLevel() {
  const levels: CEFRLevelKey[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.map((level) => ({ level, prompts: WRITING_PROMPTS.filter((p) => p.level === level) })).filter((g) => g.prompts.length > 0);
}
