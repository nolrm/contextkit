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
    // The inline branch label should say false
    expect(autoContent).toContain('model_routing: false`** (default)');
  });

  it('6. squad-auto.md uses correct haiku model ID in both dev and test sub-agent prompts', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad-auto.md'), 'utf8');
    const haiku = 'claude-haiku-4-5-20251001';
    // Should appear twice — once for dev, once for test
    const occurrences = (autoContent.match(new RegExp(haiku, 'g')) || []).length;
    expect(occurrences).toBe(2);
  });

  it('7. squad-auto.md sub-agent prompts reference correct command files', () => {
    const autoContent = fs.readFileSync(path.join(SOURCE_DIR, 'squad/squad-auto.md'), 'utf8');
    expect(autoContent).toContain('squad-dev.md` steps 3–9');
    expect(autoContent).toContain('squad-test.md` steps 3–9');
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

  it('13. Step 4 documents the Codex inline fallback since no subagent primitive is confirmed', () => {
    const step4 = content.slice(content.indexOf('## Step 4'));
    expect(step4).toContain('Codex:**');
    expect(step4).toContain('no equivalent isolated-subagent primitive');
    expect(step4).toContain('run each phase');
  });

  it("14. every dispatched phase prompt is self-contained — no phase reads another phase's reasoning", () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    const openers = [
      'You are the Architect for one story in a squad-spec run',
      'You are the Dev for one story in a squad-spec run',
      'You are the Tester for one story in a squad-spec run',
      'You are an independent Peer Reviewer for one story in a squad-spec run',
      'You are the Reviewer for one story in a squad-spec run',
      'You are the Doc writer for one story in a squad-spec run',
    ];
    for (const opener of openers) {
      expect(step4).toContain(opener);
    }
  });

  it('15. Review and Peer Review run on claude-haiku-4-5-20251001, Architect/Dev/Test/Doc stay on the default model', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    const haiku = 'claude-haiku-4-5-20251001';
    const occurrences = (step4.match(new RegExp(haiku, 'g')) || []).length;
    expect(occurrences).toBe(2);
    expect(step4).toContain(
      'Peer Review** (retry only — skip entirely when `attempts: 0`; Claude Code, dispatch with `model: claude-haiku-4-5-20251001`)'
    );
    expect(step4).toContain(
      '**Review** (Claude Code, dispatch with `model: claude-haiku-4-5-20251001`)'
    );
  });

  it('16. every dispatched phase prompt ends by writing the handoff itself and returning a status string', () => {
    const step4 = content.slice(content.indexOf('## Step 4'), content.indexOf('## Step 5'));
    const occurrences = (step4.match(/Write the handoff file yourself\. Return/g) || []).length;
    // 6 phase blocks (Architect, Dev, Test, Peer Review, Review, Doc) + 1 mention in the Step 4 intro
    expect(occurrences).toBe(7);
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
});
