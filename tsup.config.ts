import { defineConfig } from "tsup";
// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ["react", "react-dom"],
  treeshake: true,
  splitting: false,
  async onSuccess() {
    const files = ["dist/index.js", "dist/index.cjs"];
    for (const file of files) {
      const filePath = path.resolve(file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (!content.startsWith('"use client";')) {
          fs.writeFileSync(filePath, `"use client";\n${content}`);
          console.log(`Prepended "use client"; to ${file}`);
        }
      }
    }
  },
});
