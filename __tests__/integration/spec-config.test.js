const fs = require('fs-extra');
const path = require('path');

// Source files (in the package)
const SOURCE_DIR = path.resolve(__dirname, '../../commands');
// Installed copies (in .contextkit of this project itself)
const INSTALLED_DIR = path.resolve(__dirname, '../../.contextkit/commands');

// In local dev or CI, .contextkit/commands may not exist if ContextKit
// hasn't been installed into this repo. In that case, skip the
// source/installed sync assertion instead of failing with ENOENT.
const hasInstalledCommands = fs.pathExistsSync(INSTALLED_DIR);
const itInstalled = hasInstalledCommands ? it : it.skip;

describe('spec command source/installed sync', () => {
  itInstalled(
    '1. commands/spec/spec.md and .contextkit/commands/spec/spec.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'spec/spec.md'), 'utf8');
      const installed = await fs.readFile(path.join(INSTALLED_DIR, 'spec/spec.md'), 'utf8');
      expect(source).toBe(installed);
    }
  );
});

describe('spec.md — mode field, build status, validation, and drift check', () => {
  let content;

  beforeAll(async () => {
    content = await fs.readFile(path.join(SOURCE_DIR, 'spec/spec.md'), 'utf8');
  });

  it('2. full-mode template header has a structured Mode field', () => {
    expect(content).toContain(
      "> Source: [OVERVIEW_PATH] · Scope: [SCOPE_SLUG] · Mode: full · Date: [TODAY'S DATE]"
    );
  });

  it('3. lite-mode template header has a structured Mode field alongside the prose explanation', () => {
    expect(content).toContain(
      "> Source: [OVERVIEW_PATH] · Scope: [SCOPE_SLUG] · Mode: lite · Date: [TODAY'S DATE]"
    );
    expect(content).toContain(
      '> Lite mode — data model, API, and UX are defined in the source doc'
    );
  });

  it('4. Stories table template has a Status column defaulting to pending', () => {
    const occurrences = (content.match(/\| Status \|/g) || []).length;
    // Once in the header row, once each in full-mode and lite-mode templates.
    expect(occurrences).toBe(2);
    expect(content).toContain('| — | pending |');
  });

  it('5. has a Validate SPEC.md step checking EARS shape before progress files are updated', () => {
    const validateIndex = content.indexOf('### Validate SPEC.md');
    const progressIndex = content.indexOf('### Update progress files');
    expect(validateIndex).toBeGreaterThan(-1);
    expect(progressIndex).toBeGreaterThan(validateIndex);
    const validateSection = content.slice(validateIndex, progressIndex);
    expect(validateSection).toContain('WHEN [event], the system SHALL [response]');
    expect(validateSection).toContain('compound criteria');
  });

  it('6. --verify is routed in Step 1 and has its own step', () => {
    expect(content).toContain('`/spec --verify [scope-slug]`');
    expect(content).toContain('## Step 3E — Verify Scope (`--verify`)');
  });

  it('7. --verify step classifies each AC line as verified, drifted, or unknown', () => {
    const stepIndex = content.indexOf('## Step 3E — Verify Scope');
    const nextStepIndex = content.indexOf('## Step 4 — Scope Run');
    expect(stepIndex).toBeGreaterThan(-1);
    expect(nextStepIndex).toBeGreaterThan(stepIndex);
    const verifyStep = content.slice(stepIndex, nextStepIndex);
    expect(verifyStep).toContain('**verified**');
    expect(verifyStep).toContain('**drifted**');
    expect(verifyStep).toContain('**unknown**');
    expect(verifyStep).toContain('## Verification');
  });

  it('8. --verify does not touch PROGRESS.md or auto-fix anything', () => {
    const stepIndex = content.indexOf('## Step 3E — Verify Scope');
    const nextStepIndex = content.indexOf('## Step 4 — Scope Run');
    const verifyStep = content.slice(stepIndex, nextStepIndex);
    expect(verifyStep).toContain("doesn't touch `PROGRESS.md`");
    expect(verifyStep).toContain('this step only reports');
  });
});
