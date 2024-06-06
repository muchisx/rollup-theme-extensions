// @ts-check
import { readdirSync, statSync } from "fs";
import { join } from "path";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
// import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import path from "path";

const extensionsSourceDir = "extensions.src";
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

const configs = themes
  .filter((theme) => {
    const themePath = join(extensionsSourceDir, theme);

    const tsFiles = getTSFiles(themePath);

    // Only include themes that have TypeScript files
    return !!tsFiles.length;
  })
  .flatMap((theme) => {
    const themePath = join(extensionsSourceDir, theme);
    const tsFiles = getTSFiles(themePath);
    const themeOutPath = join(extensionsDir, theme);

    /**
     * @type {import('rollup').RollupOptions[]}
     */
    const configsPerFile = tsFiles.map((tsFile) => {
      console.log(`⚡ ~ configsPerFile ~ tsFile:`, tsFile);

      const themeNameCamelCase = theme
        .split("-")
        .slice(1)
        .join("-")
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase());

      const fileNameCamelCase = path
        .basename(tsFile)
        .split(".")
        .slice(0, -1)
        .join("-")
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        .replace(/^\w/, (c) => c.toUpperCase());

      const outputVariableName = `${themeNameCamelCase}${fileNameCamelCase}`;

      return {
        input: tsFile,
        plugins: [
          typescript({ tsconfig: "./tsconfig.json" }),
          terser(),
          postcss({
            extensions: [".css"],
            plugins: [],
            minimize: true,
            inject: false,
            extract: true,
          }),
        ],
        output: {
          dir: join(themeOutPath, "assets"),
          format: "iife",
          generatedCode: "es5",
          sourcemap: false,
          entryFileNames: "[name].min.js",
          name: outputVariableName,
        },
      };
    });

    return configsPerFile;
  });

if (configs.length === 0) {
  console.error("No themes found with TypeScript");
  console.error("Make sure you have at least one theme directory with TypeScript");
}

export default configs;
