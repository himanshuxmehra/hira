import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEMPLATE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', 'web', 'board-template.html'
);

/** Regenerate .hira/board.html with current ticket data baked in. Returns the file path. */
export function generateBoard(store) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const data = {
    config: store.config,
    tickets: store.list(),
    generatedAt: new Date().toISOString(),
  };
  // <-escape so ticket content can never contain a literal </script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const html = template.replace('__HIRA_DATA__', () => json);
  const outPath = path.join(store.hiraDir, 'board.html');
  fs.writeFileSync(outPath, html);
  return outPath;
}
