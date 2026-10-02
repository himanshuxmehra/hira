import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TEMPLATE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', 'web', 'board-template.html'
);

/**
 * Turn a git remote URL into the prefix for commit links (append a hash), or null if the host isn't known.
 * Handles https, ssh:// and scp-style (git@host:owner/repo) remotes for GitHub and GitLab.
 */
export function commitUrlFromRemote(remote) {
  const m = /^(?:[a-z+]+:\/\/)?(?:[^@/]+@)?([^/:]+)[/:](.+?)(?:\.git)?\/?$/i.exec((remote || '').trim());
  if (!m) return null;
  const [, host, repoPath] = m;
  if (/^github\.com$/i.test(host)) return `https://github.com/${repoPath}/commit/`;
  if (/^gitlab\.com$/i.test(host)) return `https://gitlab.com/${repoPath}/-/commit/`;
  return null;
}

function commitUrlFor(root) {
  try {
    const remote = execFileSync('git', ['-C', root, 'config', '--get', 'remote.origin.url'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return commitUrlFromRemote(remote);
  } catch {
    return null; // not a git repo, or no origin remote
  }
}

/** Regenerate .hira/board.html with current ticket data baked in. Returns the file path. */
export function generateBoard(store) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const data = {
    config: store.config,
    tickets: store.list(),
    generatedAt: new Date().toISOString(),
    commitUrl: commitUrlFor(store.root),
  };
  // <-escape so ticket content can never contain a literal </script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const html = template.replace('__HIRA_DATA__', () => json);
  const outPath = path.join(store.hiraDir, 'board.html');
  fs.writeFileSync(outPath, html);
  return outPath;
}
