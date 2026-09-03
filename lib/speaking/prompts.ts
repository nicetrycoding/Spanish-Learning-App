import type { CEFRLevelKey } from "@/lib/cefr";

export interface SpeakingPrompt {
  id: string;
  level: CEFRLevelKey;
  promptEs: string;
  promptEn: string;
}

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  { id: "s-a1-intro", level: "A1", promptEs: "Preséntate: tu nombre, tu edad y de dónde eres.", promptEn: "Introduce yourself: your name, age, and where you're from." },
  { id: "s-a2-routine", level: "A2", promptEs: "Describe tu rutina diaria.", promptEn: "Describe your daily routine." },
  { id: "s-b1-problem", level: "B1", promptEs: "Describe un problema que tuviste en el trabajo y cómo lo resolviste.", promptEn: "Describe a problem you had at work and how you solved it." },
  { id: "s-b2-opinion", level: "B2", promptEs: "¿Cuál es tu opinión sobre las redes sociales? Justifica tu respuesta.", promptEn: "What's your opinion on social media? Justify your answer." },
  { id: "s-c1-debate", level: "C1", promptEs: "Debate: ¿deberían las ciudades prohibir los coches privados en el centro?", promptEn: "Debate: should cities ban private cars downtown?" },
  { id: "s-c2-abstract", level: "C2", promptEs: "Reflexiona sobre cómo la tecnología ha cambiado la manera en que nos comunicamos, con matices y ejemplos.", promptEn: "Reflect on how technology has changed the way we communicate, with nuance and examples." },
];

export function speakingPromptsByLevel() {
  const levels: CEFRLevelKey[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.map((level) => ({ level, prompts: SPEAKING_PROMPTS.filter((p) => p.level === level) })).filter((g) => g.prompts.length > 0);
}

export interface ShadowingSentence {
  id: string;
  level: CEFRLevelKey;
  es: string;
  en: string;
}

export const SHADOWING_SENTENCES: ShadowingSentence[] = [
  { id: "sh1", level: "A1", es: "Buenos días, ¿cómo estás?", en: "Good morning, how are you?" },
  { id: "sh2", level: "A1", es: "Me gustaría un café con leche, por favor.", en: "I'd like a coffee with milk, please." },
  { id: "sh3", level: "A2", es: "¿Podrías decirme dónde está la estación de tren?", en: "Could you tell me where the train station is?" },
  { id: "sh4", level: "A2", es: "Ayer fui al mercado y compré fruta fresca.", en: "Yesterday I went to the market and bought fresh fruit." },
  { id: "sh5", level: "B1", es: "Si tuviera más tiempo, aprendería a tocar la guitarra.", en: "If I had more time, I'd learn to play guitar." },
  { id: "sh6", level: "B1", es: "No creo que sea una buena idea salir con este clima.", en: "I don't think it's a good idea to go out in this weather." },
  { id: "sh7", level: "B2", es: "A pesar de las dificultades, decidieron seguir adelante con el proyecto.", en: "Despite the difficulties, they decided to move forward with the project." },
  { id: "sh8", level: "B2", es: "Es fundamental que todos participen activamente en la reunión de mañana.", en: "It's essential that everyone actively participates in tomorrow's meeting." },
  { id: "sh9", level: "C1", es: "El impacto de esta decisión se hará sentir durante años, según los expertos.", en: "The impact of this decision will be felt for years, according to experts." },
  { id: "sh10", level: "C1", es: "No pretendo restarle importancia al asunto, simplemente creo que hay matices que no se han considerado.", en: "I don't mean to downplay the issue, I just think there are nuances that haven't been considered." },
];

export function shadowingSentencesByLevel(level: CEFRLevelKey) {
  return SHADOWING_SENTENCES.filter((s) => s.level === level);
}
