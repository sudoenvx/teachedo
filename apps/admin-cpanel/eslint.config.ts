import { reactConfig } from "@teachedo/eslint-config/react";
import { uiConfig } from "@teachedo/eslint-config/ui";

export default [
  ...reactConfig,
  ...uiConfig,
  {
    // Override specifically for this app if needed
    files: ["**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "error"
    },
  }
]
