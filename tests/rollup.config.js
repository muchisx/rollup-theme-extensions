// @ts-check
import { createRollupConfig } from "../dist/index.js";

const extensionsSourceDir = "extensions.src";
const extensionsDir = "extensions";

export default createRollupConfig({
  extensionsSourceDir,
  extensionsDir,
  minifyCss: true,
  minifyJs: true,
});
