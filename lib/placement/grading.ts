import type { PlacementItem } from "./item-bank";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ");
}

export function gradePlacementAnswer(item: PlacementItem, answer: unknown): boolean {
  switch (item.format) {
    case "multiple_choice":
    case "fill_blank":
    case "reading":
    case "listening": {
      return Number((answer as { selectedIndex?: number })?.selectedIndex) === item.correctIndex;
    }
    case "sentence_order": {
      const order = (answer as { order?: number[] })?.order ?? [];
      const correct = item.correctOrder ?? [];
      return order.length === correct.length && order.every((v, i) => v === correct[i]);
    }
    case "error_correction":
    case "translation": {
      const text = (answer as { text?: string })?.text ?? "";
      const normalized = normalize(text);
      return (item.acceptableAnswers ?? []).some((a) => normalize(a) === normalized);
    }
    default:
      return false;
  }
}
