import { defineConfig } from "eslint/config";
import { plugin as shadcn } from "@shadcn/lint"
import tsParser from "@typescript-eslint/parser"

export const uiConfig = defineConfig([  
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
            jsx: true
        }
      },
    },

    plugins: { shadcn },
    rules: {
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": ["off", {
          allow: ["layout"],
          contracts: []
        }],
        "shadcn/no-unknown-classes": "off",
        "shadcn/no-raw-colors": "off"
    }
  }
]);

export default uiConfig;
