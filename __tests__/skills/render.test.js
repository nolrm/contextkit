const { renderWrapper, resolveBody, cmdRef, yamlScalar } = require('../../lib/skills/render');
const { findSkill } = require('../../lib/skills/registry');

describe('cmdRef', () => {
  it('1. prefixes with / for claude and cursor, $ for codex, nothing for agents', () => {
    expect(cmdRef('squad-auto', 'claude')).toBe('`/squad-auto`');
    expect(cmdRef('squad-auto', 'cursor')).toBe('`/squad-auto`');
    expect(cmdRef('squad-auto', 'codex')).toBe('`$squad-auto`');
    expect(cmdRef('squad-auto', 'agents')).toBe('`squad-auto`');
  });
});

describe('resolveBody', () => {
  it('2. substitutes {{cmd:name}} tokens per target', () => {
    const body = 'Run {{cmd:squad-auto}} next.';
    expect(resolveBody(body, 'claude')).toBe('Run `/squad-auto` next.');
    expect(resolveBody(body, 'codex')).toBe('Run `$squad-auto` next.');
  });
});

describe('yamlScalar', () => {
  it('3. wraps in single quotes and doubles embedded single quotes', () => {
    expect(yamlScalar('plain')).toBe("'plain'");
    expect(yamlScalar("it's fine")).toBe("'it''s fine'");
  });
});

describe('renderWrapper', () => {
  const goal = findSkill('goal');

  it('4. claude target includes rich frontmatter and a pointer to the source command', () => {
    const out = renderWrapper(goal, 'claude');
    expect(out).toContain('description:');
    expect(out).toContain('argument-hint:');
    expect(out).toContain('allowed-tools:');
    expect(out).toContain(`.contextkit/${goal.source}`);
  });

  it('5. codex target uses name+description only, no allowed-tools/effort', () => {
    const out = renderWrapper(goal, 'codex');
    expect(out).toContain('name: goal');
    expect(out).toContain('description:');
    expect(out).not.toContain('allowed-tools:');
    expect(out).not.toContain('effort:');
  });

  it('6. agents target has no argument-hint or claude-only fields', () => {
    const out = renderWrapper(goal, 'agents');
    expect(out).toContain('name: goal');
    expect(out).not.toContain('argument-hint:');
    expect(out).not.toContain('allowed-tools:');
  });

  it('7. cursor target has a heading and no frontmatter block', () => {
    const out = renderWrapper(goal, 'cursor');
    expect(out.startsWith('# Goal')).toBe(true);
    expect(out).not.toContain('---\n');
  });

  it('8. throws on an unknown target', () => {
    expect(() => renderWrapper(goal, 'nonsense')).toThrow(/Unknown render target/);
  });
});
