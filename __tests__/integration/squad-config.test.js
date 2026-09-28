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
  itInstalled(
    '1. commands/squad/squad.md and .contextkit/commands/squad/squad.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad.md'), 'utf8');
      const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad/squad.md'), 'utf8');
      expect(source).toBe(installed);
    }
  );

  itInstalled(
    '2. commands/squad/squad-auto.md and .contextkit/commands/squad/squad-auto.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad-auto.md'), 'utf8');
      const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad/squad-auto.md'), 'utf8');
      expect(source).toBe(installed);
    }
  );
});

describe('squad config.md — content validation', () => {
  it('3. squad.md single-task section produces valid config.md with required fields', () => {
    // Parse the config block from squad.md single-task section and validate fields
    const squadContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad.md'), 'utf8');
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
    const squadContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad.md'), 'utf8');
    const batchSection = squadContent.slice(squadContent.indexOf('## Batch Mode'));
    const configBlockMatch = batchSection.match(/```markdown\n# Squad Config\n\n([\s\S]*?)```/);
    expect(configBlockMatch).not.toBeNull();
    const configBlock = configBlockMatch[1];
    expect(configBlock).toContain('checkpoint: po');
    expect(configBlock).toContain('model_routing: false');
  });

  it('5. squad-auto.md model_routing default is false (not true)', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad-auto.md'), 'utf8');
    // The default should be false
    expect(autoContent).toContain('default `model_routing` to `false`');
    // Dev/Test sub-agent dispatch should default to the primary model
    expect(autoContent).toContain('model_routing: false` (default)');
  });

  it('6. squad-auto.md routes dev and test to the haiku tier alias, never a pinned model ID', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad-auto.md'), 'utf8');
    // Twice — once for dev, once for test. An alias tracks the current Haiku
    // model; a pinned dated ID silently stays on an old one forever.
    const occurrences = (autoContent.match(/`model: haiku`/g) || []).length;
    expect(occurrences).toBe(2);
    expect(autoContent).not.toMatch(/claude-haiku-\d/);
  });

  it('7. squad-auto.md sub-agent prompts reference correct command files', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad-auto.md'), 'utf8');
    expect(autoContent).toContain('squad-dev.md` steps 3–9');
    // Tester range is 3–10, not 3–9 — includes the final handoff-update step
    // (see CHANGELOG 1.8.0: "the Tester range stopped one step short").
    expect(autoContent).toContain('squad-test.md` steps 3–10');
  });
});

describe('squad command source/installed sync — dev and test', () => {
  itInstalled(
    '8. commands/squad/squad-dev.md and .contextkit/commands/squad/squad-dev.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad-dev.md'), 'utf8');
      const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad/squad-dev.md'), 'utf8');
      expect(source).toBe(installed);
    }
  );

  itInstalled(
    '9. commands/squad/squad-test.md and .contextkit/commands/squad/squad-test.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad-test.md'), 'utf8');
      const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad/squad-test.md'), 'utf8');
      expect(source).toBe(installed);
    }
  );

  itInstalled(
    '10. commands/squad/squad-architect.md and .contextkit/commands/squad/squad-architect.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad-architect.md'), 'utf8');
      const installed = await fs.readFile(
        path.join(INSTALLED_DIR, 'squad/squad-architect.md'),
        'utf8'
      );
      expect(source).toBe(installed);
    }
  );

  itInstalled(
    '11. commands/squad/squad-spec.md and .contextkit/commands/squad/squad-spec.md are identical',
    async () => {
      const source = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad-spec.md'), 'utf8');
      const installed = await fs.readFile(path.join(INSTALLED_DIR, 'squad/squad-spec.md'), 'utf8');
      expect(source).toBe(installed);
    }
  );
});

describe('squad-spec.md — per-phase subagent dispatch', () => {
  let content;

  beforeAll(async () => {
    content = await fs.readFile(path.join(SOURCE_DIR, 'squad/squad-spec.md'), 'utf8');
  });

  it('12. Step 4 dispatches phases via the Task tool on Claude Code', () => {
    const step4 = content.slice(content.indexOf('## Step 4'));
    expect(step4).toContain('Claude Code:** dispatch each phase below using the Task tool');
    expect(step4).toContain('isolated context');
  });

  it('13. Step 4 uses Codex multi-agent isolation where available, with an inline fallback', () => {
    const step4 = content.slice(content.indexOf('## Step 4'));
    expect(step4).toContain('Codex:**');
    expect(step4).toContain('`multi_agent`');
    expect(step4).toContain('fall back to running each phase');
  });

  it("14. every dispatched phase prompt is self-contained — no phase reads another phase's reasoning", () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    const openers = [
      'You are the Architect for one story in a squad-spec run',
      'You are the Dev for one story in a squad-spec run',
      'You are the Tester for one story in a squad-spec run',
      'You are the Reviewer for one story in a squad-spec run',
      'You are the Doc writer for one story in a squad-spec run',
    ];
    for (const opener of openers) {
      expect(step4).toContain(opener);
    }
  });

  it('15. every phase — including the Review gate — runs on the primary model, and there is no Peer Review phase', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    expect(step4).not.toMatch(/haiku/i);
    expect(step4).not.toContain('Peer Review');
    expect(step4).toContain('**Review** (Claude Code: dispatch on the primary model');
  });

  it('15a. on retry, Review itself confirms each prior issue is fixed in the diff', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    expect(step4).toContain('### Prior Issues');
    expect(step4).toContain('still open until the diff shows it');
    expect(step4).toContain('Any prior issue still open is a needs-work finding');
  });

  it('16. every dispatched phase prompt ends by writing the handoff itself and returning a status string', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    const occurrences = (step4.match(/Write the handoff file yourself\. Return/g) || []).length;
    // 5 phase blocks (Architect, Dev, Test, Review, Doc) + 1 mention in the Step 4 intro
    expect(occurrences).toBe(6);
  });

  it('17. the retry loop (attempts cap) still lives with the orchestrator, not a phase prompt', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    expect(step4).toContain('attempts <= 2');
    expect(step4).toContain('attempts > 2');
    expect(step4).toContain('bookkeeping stays with the orchestrator');
  });

  it('18. handoff pre-fill copies EARS-format acceptance criteria verbatim from SPEC.md instead of re-deriving them', () => {
    const step2 = content.slice(content.indexOf('## Step 2'), content.indexOf('## Step 3'));
    expect(step2).toContain('### Acceptance Criteria');
    expect(step2).toContain('EARS-format block');
    expect(step2).toContain('verbatim');
    expect(step2).not.toContain('[From the squad command string and spec context');
  });

  it('19. Review phase checks each EARS acceptance criterion individually rather than holistically', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    expect(step4).toContain('EARS-format WHEN/IF…SHALL statements');
    expect(step4).toContain('verify trigger and required response separately');
  });

  it('20. Step 5 full-suite gate runs in the foreground with low/serial parallelism, not backgrounded at max workers', () => {
    const step5 = content.slice(content.indexOf('## Step 5'));
    expect(step5).toContain('Run it directly in the foreground');
    expect(step5).toContain('kept low or serial');
    expect(step5).not.toContain('run_in_background');
    expect(step5).not.toContain('whatever parallel/worker flags');
    expect(step5).toContain('the next scope does not start until this one is verified clean');
  });

  it('21. reads the structured Mode field first, falls back to the old Lite-mode prose sniff for older specs', () => {
    expect(content).toContain('read the `> Mode: full` or `> Mode: lite` field');
    expect(content).toContain('have no `Mode:` field — fall back to the old signal instead');
  });

  it('22. validates AC blocks against every story before creating any handoff', () => {
    const setupIndex = content.indexOf('### Create handoff files');
    const manifestIndex = content.indexOf('Create `.contextkit/squad/manifest.md`');
    expect(setupIndex).toBeGreaterThan(-1);
    expect(manifestIndex).toBeGreaterThan(setupIndex);
    const setupSection = content.slice(setupIndex, manifestIndex);
    expect(setupSection).toContain('Validate before creating any handoff');
    expect(setupSection).toContain('WHEN [event], the system SHALL [response]');
    expect(setupSection).toContain('do not create handoffs against a malformed spec');
  });

  it('23. Commit step records the build SHA in SPEC.md Stories table Status column', () => {
    expect(content).toContain('git rev-parse --short HEAD');
    expect(content).toContain('change its `Status` cell from `pending` to `done @ [sha]`');
  });
});
