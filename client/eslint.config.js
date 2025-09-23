import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import js from "@eslint/js";
import { fixupPluginRules } from "@eslint/compat";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: pluginReact,
      // The fixup utility is needed for older plugins
      "react-hooks": fixupPluginRules(pluginReactHooks),
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      // You can add any custom rules here, e.g.:
      "react/react-in-jsx-scope": "off",
    },
  }
);