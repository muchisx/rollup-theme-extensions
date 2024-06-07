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
        if (extensionsRegex.test(filePath)) {
            results.push(filePath);
        }
    });
    return results;
}

const extensionsRegex = /\.(ts|css)$/;
function createRollupConfig({ extensionsSourceDir, extensionsDir, minifyCss = false, minifyJs = false, }) {
    const themes = readdirSync(extensionsSourceDir).filter((dir) => dir.startsWith("theme-"));
    const configs = themes
        .filter((theme) => {
        const themePath = join(extensionsSourceDir, theme);
        const tsAndCssFiles = getFiles(themePath, extensionsRegex);
        return !!tsAndCssFiles.length;
    })
        .flatMap((theme) => {
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

export { createRollupConfig };
