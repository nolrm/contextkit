const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Parse download URLs from a command source file.
 * Matches patterns like: `${this.repoUrl}/path/to/file`
 * Returns an array of repo-relative paths (e.g. "hooks/pre-push.sh").
 */
function extractDownloadPaths(sourceFile) {
  const content = fs.readFileSync(sourceFile, 'utf8');
  const paths = [];
  // Match: `${this.repoUrl}/some/path` or `${base}/some/path`
  const regex = /\$\{(?:this\.repoUrl|base)\}\/([\w./-]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1]);
  }
  return [...new Set(paths)]; // deduplicate
}

/**
 * List all files in a repo directory (recursive, files only).
 */
function listRepoFiles(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  function walk(currentDir, relBase) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = `${relBase}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(path.join(currentDir, entry.name), relPath);
      } else {
        results.push(relPath);
      }
    }
  }
  walk(fullDir, dir);
  return results;
}

const installSource = path.join(ROOT, 'lib/commands/install.js');
const updateSource = path.join(ROOT, 'lib/commands/update.js');

const installPaths = extractDownloadPaths(installSource);
const updatePaths = extractDownloadPaths(updateSource);

describe('Download manifest validation', () => {
  it('1. every download URL in install.js points to a file that exists in the repo', () => {
    const missing = installPaths.filter((p) => !fs.existsSync(path.join(ROOT, p)));
    expect(missing).toEqual([]);
  });

  it('2. every download URL in update.js points to a file that exists in the repo', () => {
    const missing = updatePaths.filter((p) => !fs.existsSync(path.join(ROOT, p)));
    expect(missing).toEqual([]);
  });

  it('3. install.js and update.js download the same set of files', () => {
    // update.js intentionally skips template files (they are user-owned),
    // so we only compare the shared directories: standards, commands, hooks, types, legacy
    const sharedDirs = ['standards', 'commands', 'hooks', 'types', 'legacy'];
    const filterShared = (paths) =>
      paths.filter((p) => sharedDirs.some((d) => p.startsWith(d + '/'))).sort();

    const installShared = filterShared(installPaths);
    const updateShared = filterShared(updatePaths);

    expect(installShared).toEqual(updateShared);
  });

  it('4. no downloadable files in repo dirs are missing from the manifest', () => {
    // Directories whose files should all be referenced by install.js
    const downloadDirs = ['hooks', 'commands', 'types'];
    const repoFiles = downloadDirs.flatMap(listRepoFiles);

    const unreferenced = repoFiles.filter((f) => !installPaths.includes(f));
    expect(unreferenced).toEqual([]);
  });

  it('5. commands/core/ck.md is in both manifests and covers status, setup, update, and tidy', () => {
    expect(installPaths).toContain('commands/core/ck.md');
    expect(updatePaths).toContain('commands/core/ck.md');
    const content = fs.readFileSync(path.join(ROOT, 'commands/core/ck.md'), 'utf8');
    expect(content).toContain('## /ck setup');
    expect(content).toContain('## /ck update');
    expect(content).toContain('## /ck tidy');
    expect(content).toContain('pending-cleanup.md');
    // custom CLAUDE.md content is never moved without asking
    expect(content).toContain('**Move to `AGENTS.md`**');
    expect(content).toContain('**Keep in `CLAUDE.md`**');
  });

  it('6. commands/addons/goal.md is in both manifests and anchors long tasks to a goal file', () => {
    expect(installPaths).toContain('commands/addons/goal.md');
    expect(updatePaths).toContain('commands/addons/goal.md');
    const content = fs.readFileSync(path.join(ROOT, 'commands/addons/goal.md'), 'utf8');
    expect(content).toContain('.contextkit/goals/');
    expect(content).toContain('after any context compaction');
    expect(content).toContain('Outcomes are human-owned');
    expect(content).toContain('fresh context');
    expect(content).toContain('Never pass your own account of the work');
    expect(content).toContain('AskUserQuestion');
    expect(content).toContain('request_user_input');
  });

  it('7. commands/addons/headline.md is in both manifests and supports on, off, and pause', () => {
    expect(installPaths).toContain('commands/addons/headline.md');
    expect(updatePaths).toContain('commands/addons/headline.md');
    const content = fs.readFileSync(path.join(ROOT, 'commands/addons/headline.md'), 'utf8');
    expect(content).toContain('/headline off');
    expect(content).toContain('/headline pause');
    expect(content).toContain('<!-- headline:start -->');
  });

  it('8. commands/core/learn.md is in both manifests and logs via ck note', () => {
    expect(installPaths).toContain('commands/core/learn.md');
    expect(updatePaths).toContain('commands/core/learn.md');
    const content = fs.readFileSync(path.join(ROOT, 'commands/core/learn.md'), 'utf8');
    expect(content).toContain('ck note');
    expect(content).toContain('.contextkit/standards/');
  });

  it('9. commands/docs/doc.md is in both manifests, diff-driven by default, with level guides', () => {
    expect(installPaths).toContain('commands/docs/doc.md');
    expect(updatePaths).toContain('commands/docs/doc.md');
    const content = fs.readFileSync(path.join(ROOT, 'commands/docs/doc.md'), 'utf8');
    expect(content).toContain('## Default: Docs for the Current Change');
    expect(content).toContain('.contextkit/commands/docs/doc-arch.md');
    expect(content).toContain('.contextkit/commands/docs/doc-feature.md');
    expect(content).toContain('.contextkit/commands/docs/doc-component.md');
  });

  it('10. commands/dev/analyze.md writes the index and context rules, compact by default', () => {
    const content = fs.readFileSync(path.join(ROOT, 'commands/dev/analyze.md'), 'utf8');
    expect(content).toContain('.contextkit/standards/index.md');
    expect(content).toContain('context_rules');
    expect(content).toContain('50 lines');
    expect(content).toContain('/ck tidy');
    expect(content).toContain('The Non-Inferable Filter');
    expect(content).not.toContain('response_style');
  });

  it('11. retired squad, spec, and agents commands are in neither manifest', () => {
    const retired = [...installPaths, ...updatePaths].filter((p) =>
      /commands\/(squad|spec|agents)\/|spec-component|compress\.md|health-check/.test(p)
    );
    expect(retired).toEqual([]);
  });

  it('12. doc-arch/doc-feature/doc-component each define a Length Check with a concrete threshold', () => {
    const cases = [
      { file: 'commands/docs/doc-arch.md', threshold: '300 lines' },
      { file: 'commands/docs/doc-feature.md', threshold: '250 lines' },
      { file: 'commands/docs/doc-component.md', threshold: '150 lines' },
    ];
    for (const { file, threshold } of cases) {
      const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(content).toContain('## Length Check');
      expect(content).toContain(threshold);
      expect(content).toContain('never split silently');
    }
  });
});
