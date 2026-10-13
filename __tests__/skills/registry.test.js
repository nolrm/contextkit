const fs = require('fs-extra');
const path = require('path');

const { SKILLS, findSkill, skillsByFamily } = require('../../lib/skills/registry');

describe('skill registry', () => {
  it('1. every entry has a name, family, description, source, and body', () => {
    for (const skill of SKILLS) {
      expect(typeof skill.name).toBe('string');
      expect(skill.name.length).toBeGreaterThan(0);
      expect(typeof skill.family).toBe('string');
      expect(typeof skill.description).toBe('string');
      expect(typeof skill.source).toBe('string');
      expect(typeof skill.body).toBe('string');
    }
  });

  it("2. every entry's source file exists in commands/", () => {
    for (const skill of SKILLS) {
      const sourcePath = path.resolve(__dirname, '../../', skill.source);
      expect(fs.pathExistsSync(sourcePath)).toBe(true);
    }
  });

  it('3. names are unique', () => {
    const names = SKILLS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('4. findSkill returns the matching entry by name', () => {
    expect(findSkill('goal').name).toBe('goal');
    expect(findSkill('squad')).toBeUndefined();
  });

  it('5. skillsByFamily filters correctly and preserves order', () => {
    expect(skillsByFamily('core').map((s) => s.name)).toEqual(['ck', 'doc', 'learn']);
    expect(skillsByFamily('goal').map((s) => s.name)).toEqual(['goal']);
  });

  it('6. ships exactly the five 2.0 skills', () => {
    expect(SKILLS.map((s) => s.name)).toEqual(['ck', 'doc', 'learn', 'goal', 'headline']);
  });

  it('7. no registered skill is also listed as retired', () => {
    const { RETIRED_SKILLS } = require('../../lib/skills/retired');
    expect(SKILLS.filter((s) => RETIRED_SKILLS[s.name])).toEqual([]);
  });

  it('8. every effort value is one Claude Code accepts', () => {
    const valid = ['low', 'medium', 'high', 'xhigh', 'max'];
    for (const skill of SKILLS) {
      if (skill.claude?.effort) expect(valid).toContain(skill.claude.effort);
    }
  });
});
