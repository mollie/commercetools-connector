import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jest from "eslint-plugin-jest";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
    {
        ignores: [
            "dist/**",
            "build/**",
            "public/**",
            "coverage/**",
            "node_modules/**",
            ".yarn/**",
            ".pnp.*",
        ],
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,

    // Base rules for app code (ESM)
    {
        files: ["**/*.{js,ts,tsx}"],
        plugins: {
            jest,
            import: importPlugin,
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
        rules: {
            ...prettier.rules,

            "@typescript-eslint/no-unused-vars": "off",

            // enables "import/no-duplicates" etc.
            "import/no-duplicates": "error",
        },
    },

    // Jest test files
    {
        files: ["test/**/*.{js,ts,tsx}", "**/*.spec.{js,ts,tsx}", "**/*.test.{js,ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node,
            },
        },
        rules: {
            ...jest.configs.recommended.rules,
        },
    },

    {
        files: [
            "*.config.js",
            "*.config.cjs",
            "jest*.js",
            "jest*.cjs",
            "setup.js",
            ".eslintrc.js",
            "intl-formatter.js",
            "jest-runner-eslint.config.js",
        ],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.commonjs,
                ...globals.jest, // for setup.js if it uses jest globals
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },

    {
        files: ["**/*.d.ts"],
        rules: {
            "@typescript-eslint/prefer-namespace-keyword": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            // if you don’t care about import rules in d.ts:
            "import/no-duplicates": "off",
        },
    },

    {
        files: ["src/hooks/**/use-*-connector.ts"],
        rules: {
            "@typescript-eslint/triple-slash-reference": "off",
        },
    },
];
