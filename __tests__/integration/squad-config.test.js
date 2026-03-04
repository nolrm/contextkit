const fs = require('fs-extra');
const path = require('path');

// Source files (in the package)
const SOURCE_DIR = path.resolve(__dirname, '../../commands');
// Installed copies (in .contextkit of this project itself)
const INSTALLED_DIR = path.resolve(__dirname, '../../.contextkit/commands');

// In local dev or CI, .contextkit/commands may not exist if ContextKit
// hasn't been installed into this repo. In that case, skip the
// source/installed sync assertions instead of failing with ENOENT.
const hasInstalledCommands = fs.pathExistsSync(INSTALLED_DIR);
const itInstalled = hasInstalledCommands ? it : it.skip;

describe('squad command source/installed sync', () => {
  itInstalled('1. commands/squad.md and .contextkit/commands/squad.md are identical', async () => {
    const source = await fs.readFile(path.join(SOURCE_DIR, 'squad.md'), 'utf8');
    const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad.md'), 'utf8');
    expect(source).toBe(installed);
  });

  itInstalled('2. commands/squad-auto.md and .contextkit/commands/squad-auto.md are identical', async () => {
    const source = await fs.readFile(path.join(SOURCE_DIR, 'squad-auto.md'), 'utf8');
    const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad-auto.md'), 'utf8');
    expect(source).toBe(installed);
  });
});

describe('squad config.md — content validation', () => {
  it('3. squad.md single-task section produces valid config.md with required fields', () => {
    // Parse the config block from squad.md single-task section and validate fields
    const squadContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad.md'), 'utf8');
    const singleTaskSection = squadContent.slice(
      squadContent.indexOf('## Single-Task Mode'),
      squadContent.indexOf('## Batch Mode')
    );
    // Find the markdown code block containing the config
    const configBlockMatch = singleTaskSection.match(/```markdown\n([\s\S]*?)```/);
    expect(configBlockMatch).not.toBeNull();
    const configBlock = configBlockMatch[1];
    expect(configBlock).toContain('checkpoint:');
    expect(configBlock).toContain('model_routing:');
  });

  it('4. squad.md batch section config template has both checkpoint and model_routing', () => {
    const squadContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad.md'), 'utf8');
    const batchSection = squadContent.slice(squadContent.indexOf('## Batch Mode'));
    const configBlockMatch = batchSection.match(/```markdown\n# Squad Config\n\n([\s\S]*?)```/);
    expect(configBlockMatch).not.toBeNull();
    const configBlock = configBlockMatch[1];
    expect(configBlock).toContain('checkpoint: po');
    expect(configBlock).toContain('model_routing: false');
  });

  it('5. squad-auto.md model_routing default is false (not true)', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad-auto.md'), 'utf8');
    // The default should be false
    expect(autoContent).toContain('default `model_routing` to `false`');
    // The inline branch label should say false
    expect(autoContent).toContain('model_routing: false`** (default)');
  });

  it('6. squad-auto.md uses correct haiku model ID in both dev and test sub-agent prompts', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad-auto.md'), 'utf8');
    const haiku = 'claude-haiku-4-5-20251001';
    // Should appear twice — once for dev, once for test
    const occurrences = (autoContent.match(new RegExp(haiku, 'g')) || []).length;
    expect(occurrences).toBe(2);
  });

  it('7. squad-auto.md sub-agent prompts reference correct command files', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad-auto.md'), 'utf8');
    expect(autoContent).toContain('squad-dev.md` steps 3–9');
    expect(autoContent).toContain('squad-test.md` steps 3–9');
  });
});

describe('squad command source/installed sync — dev and test', () => {
  itInstalled('8. commands/squad-dev.md and .contextkit/commands/squad-dev.md are identical', async () => {
    const source = await fs.readFile(path.join(SOURCE_DIR, 'squad-dev.md'), 'utf8');
    const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad-dev.md'), 'utf8');
    expect(source).toBe(installed);
  });

  itInstalled('9. commands/squad-test.md and .contextkit/commands/squad-test.md are identical', async () => {
    const source = await fs.readFile(path.join(SOURCE_DIR, 'squad-test.md'), 'utf8');
    const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad-test.md'), 'utf8');
    expect(source).toBe(installed);
  });
});
