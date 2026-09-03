import "server-only";
import { GoogleGenAI } from "@google/genai";

let cachedClient: GoogleGenAI | null | undefined;

function getClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  cachedClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return cachedClient;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export interface GenerateOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
}

/**
 * Low-level call to the configured AI provider. Returns raw text, or null
 * if no provider is configured or the call failed — callers must have a
 * deterministic fallback for the null case (see lib/ai/service.ts). This
 * is the only file that imports the Gemini SDK / touches the API key, so
 * swapping providers means editing this file alone.
 */
export async function generateText(options: GenerateOptions): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const model = process.env.AI_MODEL || "gemini-2.5-flash";
    const response = await client.models.generateContent({
      model,
      contents: options.prompt,
      config: {
        systemInstruction: options.system,
        maxOutputTokens: options.maxTokens ?? 1024,
      },
    });
    return (response.text ?? "").trim();
  } catch (error) {
    console.error("[ai] provider call failed:", error);
    return null;
  }
}

/** Extracts a JSON object/array from a model response, tolerating markdown code fences. */
export function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate.trim());
  } catch {
    // Try to find the first top-level {...} or [...] block as a last resort.
    const match = candidate.match(/[[{][\s\S]*[\]}]/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
