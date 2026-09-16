import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from 'eslint-plugin-jsx-a11y';
import turboPlugin from "eslint-plugin-turbo";
import { baseConfig } from "./base.js"; // Note: import from .js extension even for TS files in ESM
import { defineConfig } from "eslint/config";


export const reactConfig = defineConfig([
  ...baseConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReactHooks.configs.flat.recommended,
      pluginReactRefresh.configs.recommended
    ],
    languageOptions: {
      globals: {
        ...globals.browser
      },
    },
    settings: {
      react: {
        version: "19", // Force React 19 version to avoid detection errors
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // React 17+ / 19 doesn't need React in scope
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ['**/*.{js,jsx,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.serviceworker
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    /** @type {import('eslint-plugin-jsx-a11y/lib/rules')} */ 
    rules: {
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
    },
  },

  {
    plugins: {
      turbo: turboPlugin
    },

    rules: {
      "turbo/no-undeclared-env-vars": ["warn"]
    }
  }
]);

export default reactConfig;



