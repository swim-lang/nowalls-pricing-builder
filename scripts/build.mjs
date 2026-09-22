import { cp, rm } from "node:fs/promises";
import { build } from "vite";

await build({
  configFile: "vite.config.ts",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

// GitHub Pages serves the tracked docs directory. Keep it identical to the
// production Vite output so both previews use compiled, versioned styles.
await rm("docs", { recursive: true, force: true });
await cp("dist", "docs", { recursive: true });
