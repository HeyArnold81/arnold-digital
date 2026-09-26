import fs from "node:fs/promises";
import path from "node:path";
import { minify as minifyHtml } from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify as minifyJs } from "terser";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "dist");

// Only these root entries belong in the published website.
const PUBLIC_ENTRIES = new Set([
  "index.html",
  "privacy.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "CNAME",
  ".nojekyll",
  "assets",
  "css",
  "js",
  "demos",
]);

const PUBLIC_EXTENSIONS = new Set([
  ".html", ".css", ".js", ".svg", ".webp", ".png", ".jpg",
  ".jpeg", ".gif", ".ico", ".avif", ".woff", ".woff2", ".ttf",
]);

async function buildDirectory(source, destination) {
  await fs.mkdir(destination, {
    recursive: true,
  });

  const entries = await fs.readdir(source, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    // Never follow links or publish hidden files and backup formats in assets.
    if (entry.isSymbolicLink() ||
        (source === ROOT ? !PUBLIC_ENTRIES.has(entry.name) :
          entry.name.startsWith(".") ||
          (entry.isFile() && !PUBLIC_EXTENSIONS.has(path.extname(entry.name).toLowerCase())))) {
      continue;
    }

    const sourcePath = path.join(
      source,
      entry.name
    );

    const destinationPath = path.join(
      destination,
      entry.name
    );

    if (entry.isDirectory()) {
      await buildDirectory(
        sourcePath,
        destinationPath
      );

      continue;
    }

    const extension =
      path.extname(entry.name).toLowerCase();

    if (extension === ".html") {
      const html = await fs.readFile(
        sourcePath,
        "utf8"
      );

      const output = await minifyHtml(
        html,
        {
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          sortAttributes: false,
          sortClassName: false,
          minifyCSS: true,
          minifyJS: true,
        }
      );

      await fs.writeFile(
        destinationPath,
        output
      );

      continue;
    }

    if (extension === ".css") {
      const css = await fs.readFile(
        sourcePath,
        "utf8"
      );

      const result =
        new CleanCSS({
          level: 2,
        }).minify(css);

      if (result.errors.length) {
        throw new Error(
          result.errors.join("\n")
        );
      }

      await fs.writeFile(
        destinationPath,
        result.styles
      );

      continue;
    }

    if (extension === ".js") {
      const javascript =
        await fs.readFile(
          sourcePath,
          "utf8"
        );

      const result = await minifyJs(
        javascript,
        {
          compress: true,
          mangle: true,
        }
      );

      if (!result.code) {
        throw new Error(
          `Unable to minify ${sourcePath}`
        );
      }

      await fs.writeFile(
        destinationPath,
        result.code
      );

      continue;
    }

    await fs.copyFile(
      sourcePath,
      destinationPath
    );
  }
}

await fs.rm(OUTPUT, {
  recursive: true,
  force: true,
});

await buildDirectory(
  ROOT,
  OUTPUT
);

console.log(
  "Production build created in dist/"
);
