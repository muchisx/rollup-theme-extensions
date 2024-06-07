# Rollup Theme Extensions (Shopify Apps)

![NPM Version](https://img.shields.io/npm/v/rollup-theme-extensions)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/muchisx/rollup-theme-extensions/main)

This a generator for Rollup configs to build Shopify theme app extensions with typescript and (in the future) css preprocessors.

## Features:

- Typescript compilation
- Typescript minification (optional)
- Rollup bundling
- Sourcemaps (currently turned off because Shopify doesn't allow sourcemaps file extension inside the /assets folder)
- CSS minification (optional)
- Custom source folder
- Custom output folder

## Installation

```bash
npm install --save-dev rollup-theme-extensions rollup
```

## Usage

> _in `rollup.config.mjs`_

```js
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
```

> _in `package.json`_

```json
{
  "scripts": {
    "ext:theme-build": "npx rollup -c",
    "ext:theme-watch": "npx rollup -c --watch"
  }
}
```

You can call your scripts however you want, the ones above are just examples, and you can also make them more specific to your project (like launch a specific config file).

## Options

- `extensionsSourceDir` (string): The source folder where your extension files are located (it will look for folders that start with `theme-` prefix, and inside them, it will look for a folder called `assets`, and use those files for compilation).
- `extensionsDir` (string): The output folder where the compiled files will be placed (they will always be placed inside an `assets` folder).
- `minifyCss` (boolean): Whether to minify the CSS files or not.
- `minifyJs` (boolean): Whether to minify the JS files or not.

## License

MIT License

## Contributing

Feel free to open an issue or a pull request if you have any suggestions or improvements.

## Author

[muchisx](https://github.com/muchisx)
