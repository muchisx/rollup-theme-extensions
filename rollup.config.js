// @ts-check
import { readdirSync, statSync } from "fs";
import { join } from "path";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";

const extensionsSourceDir = "extensions.source";
const extensionsDir = "extensions";

// Get all theme directories
const themes = readdirSync(extensionsSourceDir).filter((dir) => dir.startsWith("theme-"));

// Function to get all TypeScript files in a directory
function getTSFiles(dir) {
  let results = [];
  const list = readdirSync(dir);
  list.forEach((file) => {
    file = join(dir, file);
    const stat = statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTSFiles(file));
    } else if (file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

export default themes.map((theme) => {
  const themePath = join(extensionsSourceDir, theme);
  const themeOutPath = join(extensionsDir, theme);
  const tsFiles = getTSFiles(join(themePath, "assets"));

  /**
   * @type {import('rollup').RollupOptions}
   */
  const config = {
    input: tsFiles,
    plugins: [
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
      postcss({
        plugins: [],
        minimize: true,
        extract: true,
      }),
      copy({
        targets: [
          { src: join(themePath, "assets", "*.png"), dest: join(themeOutPath, "assets") },
          { src: join(themePath, "assets", "*.css"), dest: join(themeOutPath, "assets") },
        ],
        hook: "writeBundle",
      }),
    ],
    output: {
      dir: join(themeOutPath, "assets"),
      format: "es",
      sourcemap: false,
      entryFileNames: "[name].min.js",
    },
  };

  return config;
});
