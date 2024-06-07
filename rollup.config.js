import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "module",
  },
  external: ["fs", "path"],
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
  preserveSymlinks: true,
  watch: {
    include: "src/**",
  },
});
