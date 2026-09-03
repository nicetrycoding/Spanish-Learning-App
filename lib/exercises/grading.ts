import type { ExerciseTypeKey } from "./schemas";

export interface GradeResult {
  isCorrect: boolean;
  score: number; // 0-1, used for partial credit on multi-question exercises
  correctAnswer?: unknown;
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents for lenient matching
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ");
}

function matchesAny(answer: string, acceptable: string[]): boolean {
  const normAnswer = normalize(answer);
  return acceptable.some((a) => normalize(a) === normAnswer);
}

/**
 * Grades a single exercise attempt server-side. `data` is the (already
 * schema-validated) exercise payload; `userAnswer` is the client-submitted
 * response, shaped per exercise type (see components/features/practice/*).
 */
export function gradeExercise(
  type: ExerciseTypeKey,
  data: any,
  userAnswer: any,
): GradeResult {
  switch (type) {
    case "MULTIPLE_CHOICE":
    case "CONTEXTUAL_SELECT":
    case "TENSE_SELECT":
    case "MISSING_WORD": {
      const isCorrect = Number(userAnswer?.selectedIndex) === data.correctIndex;
      return { isCorrect, score: isCorrect ? 1 : 0, correctAnswer: data.correctIndex };
    }

    case "FLASHCARD": {
      const isCorrect = Boolean(userAnswer?.knewIt);
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    case "MATCHING": {
      const pairs: { left: string; right: string }[] = data.pairs;
      const submitted: Record<string, string> = userAnswer?.matches ?? {};
      let correctCount = 0;
      for (const pair of pairs) {
        if (submitted[pair.left] === pair.right) correctCount++;
      }
      const score = pairs.length ? correctCount / pairs.length : 0;
      return { isCorrect: score === 1, score };
    }

    case "TRANSLATION":
    case "FILL_BLANK":
    case "SENTENCE_TRANSFORM":
    case "ERROR_CORRECTION":
    case "DICTATION": {
      const text: string = userAnswer?.text ?? "";
      const isCorrect = matchesAny(text, data.acceptableAnswers);
      return { isCorrect, score: isCorrect ? 1 : 0, correctAnswer: data.acceptableAnswers[0] };
    }

    case "SENTENCE_ORDER": {
      const order: number[] = userAnswer?.order ?? [];
      const isCorrect =
        order.length === data.correctOrder.length &&
        order.every((v: number, i: number) => v === data.correctOrder[i]);
      return { isCorrect, score: isCorrect ? 1 : 0, correctAnswer: data.correctOrder };
    }

    case "READING_COMPREHENSION":
    case "LISTENING_COMPREHENSION": {
      const answers: Record<string, number> = userAnswer?.answers ?? {};
      const questions = data.questions as { id: string; correctIndex: number }[];
      let correctCount = 0;
      for (const q of questions) {
        if (answers[q.id] === q.correctIndex) correctCount++;
      }
      const score = questions.length ? correctCount / questions.length : 0;
      return { isCorrect: score >= 0.6, score };
    }

    case "WRITING_PROMPT":
    case "SPEAKING_PROMPT": {
      // Graded qualitatively by AIService.evaluateWriting/evaluateSpeaking,
      // not by this deterministic grader. A submission always "completes"
      // the exercise; quality is tracked separately.
      return { isCorrect: true, score: 1 };
    }

    default:
      return { isCorrect: false, score: 0 };
  }
}
