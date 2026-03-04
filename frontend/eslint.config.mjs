import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config =  [
  ...nextConfig,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      }],
    },
  },
  {
    ignores: ["**/generated/**", ".next/**", "coverage/**"],
  },
];

export default config;