import typescript from '@rollup/plugin-typescript';
import { readdirSync, statSync } from 'fs';
import path, { join } from 'path';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

function getFiles(dirPath, extensionsRegex) {
    let results = [];
    const fileList = readdirSync(dirPath);
    fileList.forEach((file) => {
        const filePath = join(dirPath, file);
        const fileStat = statSync(filePath);
        if (fileStat && fileStat.isDirectory()) {
            results = results.concat(getFiles(filePath, extensionsRegex));
            return;
        }
        // Only include TypeScript and CSS files
        // More could be added here if needed, plugins must be added to the rollup config
        if (extensionsRegex.test(filePath)) {
            results.push(filePath);
        }
    });
    return results;
}

const extensionsRegex = /\.(ts|css)$/;
function createRollupConfig({ extensionsSourceDir, extensionsDir }) {
    // Get all theme directories
    const themes = readdirSync(extensionsSourceDir).filter((dir) => dir.startsWith("theme-"));
    // Function to get all TypeScript and CSS files in a directory
    const configs = themes
        .filter((theme) => {
        const themePath = join(extensionsSourceDir, theme);
        // TODO [1] - Optimize, now it's running twice
        const tsFiles = getFiles(themePath, extensionsRegex);
        // Only include themes that have TypeScript files
        return !!tsFiles.length;
    })
        .flatMap((theme) => {
        // TODO [1] - Optimize, now it's running twice
        const themePath = join(extensionsSourceDir, theme);
        const tsFiles = getFiles(themePath, extensionsRegex);
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
                    typescript({
                        target: "ES2022",
                        module: "ES2015",
                        moduleResolution: "Bundler",
                        sourceMap: false,
                        esModuleInterop: true,
                        skipLibCheck: true,
                    }),
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
    return configs;
}

export { createRollupConfig };
