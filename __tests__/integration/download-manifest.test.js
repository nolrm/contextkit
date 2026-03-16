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
  // Match: `${this.repoUrl}/some/path`
  const regex = /\$\{this\.repoUrl\}\/([\w./-]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1]);
  }
  return [...new Set(paths)]; // deduplicate
}

/**
 * List all files in a repo directory (non-recursive, files only).
 */
function listRepoFiles(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => `${dir}/${d.name}`);
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

  it('5. commands/health-check.md contains the update check step', () => {
    const content = fs.readFileSync(path.join(ROOT, 'commands/health-check.md'), 'utf8');
    expect(content).toContain('npm view @nolrm/contextkit version');
    expect(content).toContain('status.json');
    expect(content).toContain('ck update');
  });

  it('6. commands/squad-doc.md is in both install and update manifests and contains doc instructions', () => {
    expect(installPaths).toContain('commands/squad-doc.md');
    expect(updatePaths).toContain('commands/squad-doc.md');
    const content = fs.readFileSync(path.join(ROOT, 'commands/squad-doc.md'), 'utf8');
    expect(content).toContain('companion');
    expect(content).toContain('`doc`');
    expect(content).toContain('## 7. Doc');
  });

  it('7. commands/squad-architect.md contains the complexity check step and split signal', () => {
    const content = fs.readFileSync(path.join(ROOT, 'commands/squad-architect.md'), 'utf8');
    expect(content).toContain('Evaluate complexity');
    expect(content).toContain('### Recommended Split');
    expect(content).toContain('po-clarify');
    expect(content).toContain('7 files');
  });

  it('8. commands/squad.md Clarification Mode handles split recommendation', () => {
    const content = fs.readFileSync(path.join(ROOT, 'commands/squad.md'), 'utf8');
    expect(content).toContain('### Recommended Split');
    expect(content).toContain('Approve split');
    expect(content).toContain('Proceed as-is');
  });

  it('9. commands/squad-auto.md po-clarify message covers split scenario', () => {
    const content = fs.readFileSync(path.join(ROOT, 'commands/squad-auto.md'), 'utf8');
    expect(content).toContain('split recommendation');
  });
});
