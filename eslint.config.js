import eslint from "@eslint/js";
import angular from "angular-eslint";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.angular/**",
      "**/*.min.js",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["frontend/src/**/*.ts"],
    extends: [
      ...angular.configs.tsRecommended,
    ],
  },
  {
    files: ["frontend/src/**/*.html"],
    extends: [...angular.configs.templateRecommended],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
