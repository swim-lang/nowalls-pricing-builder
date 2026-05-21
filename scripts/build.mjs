import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";

await mkdir("dist/assets", { recursive: true });

await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  outfile: "dist/assets/index.js",
  format: "esm",
  jsx: "automatic",
  minify: true,
  sourcemap: false,
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
  },
});

await writeFile(
  "dist/index.html",
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>No Walls Pricing Builder</title>
    <link rel="icon" href="https://framerusercontent.com/images/LPlC9tqmKBjfv4PD9XJCmiZDn9s.png" />
    <script>
      window.tailwind = {
        config: {
          theme: {
            extend: {
              fontFamily: {
                sans: ["Inter", "Helvetica Neue", "Arial", "system-ui", "sans-serif"]
              },
              boxShadow: {
                "soft-xl": "0 24px 90px rgba(48, 38, 28, 0.12)"
              },
              animation: {
                "fade-up": "fadeUp 480ms ease-out both"
              },
              keyframes: {
                fadeUp: {
                  "0%": { opacity: "0", transform: "translateY(14px)" },
                  "100%": { opacity: "1", transform: "translateY(0)" }
                }
              }
            }
          }
        }
      };
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      :root {
        color: #111011;
        background: #f1f1f1;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        min-width: 320px;
        min-height: 100vh;
        margin: 0;
      }

      button,
      a {
        -webkit-tap-highlight-color: transparent;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }
    </style>
    <script type="module" crossorigin src="./assets/index.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
);
