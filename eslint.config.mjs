import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "public/sw.js"],
  },
  {
    rules: {
      // The exercise/AI-content renderers deliberately handle genuinely
      // polymorphic JSON (16 exercise types, AI-generated content) — `any`
      // there is a scoped, intentional trade-off, not carelessness. Kept as
      // a warning (visible in CI) rather than off entirely.
      "@typescript-eslint/no-explicit-any": "warn",
      // Plain apostrophes/quotes in JSX text content, not a correctness issue.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
