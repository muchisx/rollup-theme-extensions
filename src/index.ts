import typescript from "@rollup/plugin-typescript";
import { readdirSync } from "fs";
import path, { join } from "path";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";
import { getFiles } from "./utils";

type createRollupConfigOptions = {
  extensionsSourceDir: string;
  extensionsDir: string;
  minifyJs?: boolean;
  minifyCss?: boolean;
};

const extensionsRegex = /\.(ts|css)$/;

export function createRollupConfig({
  extensionsSourceDir,
  extensionsDir,
  minifyCss = false,
  minifyJs = false,
}: createRollupConfigOptions) {
  // Get all theme directories
  const themes = readdirSync(extensionsSourceDir).filter((dir) => dir.startsWith("theme-"));

  // Function to get all TypeScript and CSS files in a directory

  const configs = themes
    .filter((theme) => {
      const themePath = join(extensionsSourceDir, theme);

      // TODO [1] - Optimize, now it's running twice
      const tsAndCssFiles = getFiles(themePath, extensionsRegex);

      // Only include themes that have TypeScript files
      return !!tsAndCssFiles.length;
    })
    .flatMap((theme) => {
      // TODO [1] - Optimize, now it's running twice
      const themePath = join(extensionsSourceDir, theme);
      const tsAndCssFiles = getFiles(themePath, extensionsRegex);
      const themeOutPath = join(extensionsDir, theme);

      const configsPerFile = tsAndCssFiles.map((tsFile) => {
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
            typescript({
              target: "ES2022",
              module: "ES2015",
              moduleResolution: "Bundler",
              sourceMap: false,
              esModuleInterop: true,
              skipLibCheck: true,
            }),
            ...(minifyJs ? [terser()] : []),
            postcss({
              extensions: [".css"],
              plugins: [],
              minimize: minifyCss,
              inject: false,
              extract: true,
            }),
          ],
          output: {
            dir: join(themeOutPath, "assets"),
            format: "iife",
            generatedCode: "es5",
            sourcemap: false,
            entryFileNames: "[name].js",
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

  return configs;
}
