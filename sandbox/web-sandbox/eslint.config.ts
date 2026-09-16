import { reactConfig } from "@teachedo/eslint-config/react";

export default [
  ...reactConfig,
  {
    // Override specifically for this app if needed
    files: ["**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "error"
    },
  }
]
