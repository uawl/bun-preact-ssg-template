import path from "path";
import { render } from "preact-render-to-string";

const HTML_TEMPLATE = (title: string, content: string, jsPath: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Bun.escapeHTML(title)}</title>
    <script src="${jsPath}" type="module"></script>
  </head>
  <body>
    ${content}
  </body>
</html>`;

const BUILD_FAILED_TEMPLATE = (logs: (BuildMessage | ResolveMessage)[]) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
  </head>
  <body>
    ${Bun.escapeHTML(`${logs}`)}
  </body>
</html>`

for await (const page of new Bun.Glob("./src/pages/**/*.tsx").scan()) {
  const fileName = path.basename(page, ".tsx");
  const outDir = path.dirname(path.relative("src/pages", page));
  Bun.build({
    entrypoints: ["./template.tsx"],
    define: { PAGE: page },
    target: "browser",
    minify: false
  }).then(async ({ success, outputs: [output], logs }) => {
    if (success) {
      import(page).then(async ({ default: Page, title }) => {
        const html = HTML_TEMPLATE(title ?? fileName, render(<Page />), `${outDir}/${fileName}.js`);
        Bun.write(`dist/${outDir}/${fileName}.html`, html);
      });
      output!.text().then(text => Bun.write(`dist/${outDir}/${fileName}.js`, text));
    } else {
      const html = BUILD_FAILED_TEMPLATE(logs);
      Bun.write(`dist/${outDir}/${fileName}.html`, html);
    }
  });
}
