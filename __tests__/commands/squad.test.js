const fs = require('fs-extra');
const path = require('path');

const SQUAD_MD = path.resolve(__dirname, '../../commands/squad/squad.md');
const SQUAD_AUTO_MD = path.resolve(__dirname, '../../commands/squad/squad-auto.md');

describe('squad.md — source command file', () => {
  let content;

  beforeAll(async () => {
    content = await fs.readFile(SQUAD_MD, 'utf8');
  });

  it('1. single-task mode creates config.md with model_routing field', () => {
    expect(content).toContain('Create `.contextkit/squad/config.md`');
    expect(content).toContain('model_routing: false');
  });

  it('2. single-task config.md includes checkpoint field', () => {
    // Ensure the full config block is present in single-task section
    const singleTaskSection = content.slice(
      content.indexOf('## Single-Task Mode'),
      content.indexOf('## Batch Mode')
    );
    expect(singleTaskSection).toContain('checkpoint: po');
    expect(singleTaskSection).toContain('model_routing: false');
  });

  it('3. single-task mode includes user-facing hint about model_routing', () => {
    const singleTaskSection = content.slice(
      content.indexOf('## Single-Task Mode'),
      content.indexOf('## Batch Mode')
    );
    expect(singleTaskSection).toContain('model_routing: true');
    expect(singleTaskSection).toContain('Haiku');
  });

  it('4. batch mode config.md template includes model_routing field', () => {
    const batchSection = content.slice(content.indexOf('## Batch Mode'));
    expect(batchSection).toContain('model_routing: false');
  });

  it('5. batch mode config.md includes explanatory note for model_routing', () => {
    const batchSection = content.slice(content.indexOf('## Batch Mode'));
    expect(batchSection).toContain('model_routing: true');
    expect(batchSection).toContain('Haiku');
  });

  it('6. single-task mode step numbering is sequential with no duplicates', () => {
    const singleTaskSection = content.slice(
      content.indexOf('## Single-Task Mode'),
      content.indexOf('## Batch Mode')
    );
    // Extract numbered steps like "1. ", "2. ", etc.
    const steps = [...singleTaskSection.matchAll(/^\d+\. /gm)].map((m) => parseInt(m[0]));
    for (let i = 0; i < steps.length; i++) {
      expect(steps[i]).toBe(i + 1);
    }
    expect(steps.length).toBeGreaterThanOrEqual(6);
  });
});

describe('squad-auto.md — source command file', () => {
  let content;

  beforeAll(async () => {
    content = await fs.readFile(SQUAD_AUTO_MD, 'utf8');
  });

  it('1. step 1 handles single-task fallback when no manifest.md exists', () => {
    expect(content).toContain('handoff.md` exists');
    expect(content).toContain('single-task mode');
  });

  it('2. step 1 instructs using handoff top-level status for phase detection', () => {
    expect(content).toContain("handoff's top-level `status:`");
  });

  it('3. step 1 handles missing squad session (neither manifest nor handoff)', () => {
    expect(content).toContain('neither exists');
    expect(content).toContain('Run `/squad');
  });

  it('4. step 2 reads model_routing from config with default false', () => {
    expect(content).toContain('model_routing');
    expect(content).toContain('default `model_routing` to `false`');
  });

  it('5. dev phase has model_routing: false inline branch', () => {
    const devSection = content.slice(content.indexOf('**Dev:**'), content.indexOf('**Test:**'));
    expect(devSection).toContain('model_routing: false');
    expect(devSection).toContain('run inline');
  });

  it('6. dev phase spawns haiku sub-agent when model_routing: true', () => {
    const devSection = content.slice(content.indexOf('**Dev:**'), content.indexOf('**Test:**'));
    expect(devSection).toContain('model_routing: true');
    expect(devSection).toContain('claude-haiku-4-5-20251001');
    expect(devSection).toContain('squad-dev.md');
  });

  it('7. test phase spawns haiku sub-agent when model_routing: true', () => {
    const testSection = content.slice(content.indexOf('**Test:**'), content.indexOf('**Review:**'));
    expect(testSection).toContain('model_routing: true');
    expect(testSection).toContain('claude-haiku-4-5-20251001');
    expect(testSection).toContain('squad-test.md');
  });

  it('8. sub-agent error handling stops the pipeline', () => {
    expect(content).toContain('"error: ..."');
    expect(content).toContain('surface the error to the user and stop the pipeline');
  });

  it('9. review phase has no model_routing conditional (always primary model)', () => {
    const reviewSection = content.slice(content.indexOf('**Review:**'));
    // Review section should not contain model_routing branching
    expect(reviewSection).not.toContain('model_routing: true');
    expect(reviewSection).not.toContain('model_routing: false');
  });

  it('10. sub-agent prompt includes handoff file placeholder', () => {
    expect(content).toContain('[HANDOFF_FILE]');
  });
});
