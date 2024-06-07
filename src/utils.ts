import { readdirSync, statSync } from "fs";
import { join } from "path";

export function getFiles(dirPath: string, extensionsRegex: RegExp) {
  let results: string[] = [];
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
