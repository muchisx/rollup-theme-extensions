// @ts-check
import { createRollupConfig } from "rollup-theme-extensions";

const extensionsSourceDir = "extensions.src";
const extensionsDir = "extensions";

export default createRollupConfig({
  extensionsSourceDir,
  extensionsDir,
  minifyCss: true,
  minifyJs: true,
});
