import { build } from "esbuild";

build({
  entryPoints: ["src/cli.js"],
  bundle: true,
  platform: "node",
  target: "node16",
  format: "cjs",
  outfile: "dist/cli.cjs",
  banner: {
    js: "#!/usr/bin/env node",
  },
}).catch(() => process.exit(1));
