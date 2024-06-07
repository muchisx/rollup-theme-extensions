/* eslint-env node */

/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  globals: {},
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  root: true,
  rules: {
    "no-console": "warn",
  },
};
