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
    expect(findSkill('squad').name).toBe('squad');
    expect(findSkill('does-not-exist')).toBeUndefined();
  });

  it('5. skillsByFamily filters correctly and preserves order', () => {
    const squadSkills = skillsByFamily('squad');
    expect(squadSkills.length).toBeGreaterThan(0);
    expect(squadSkills.every((s) => s.family === 'squad')).toBe(true);
  });

  it('6. spec family includes both spec and spec-component, spec first', () => {
    const specSkills = skillsByFamily('spec').map((s) => s.name);
    expect(specSkills).toEqual(['spec', 'spec-component']);
  });
});
