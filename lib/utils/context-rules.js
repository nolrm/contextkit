const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// Context rules — `.contextkit/config.yml` → `context_rules` maps each topic
// standards file to the paths it applies to. Integrations render the list into
// their tool's path-scoped rule format, so a topic file loads only when the
// model touches matching files instead of in every session. `/ck setup` and
// `/ck tidy` decide the mapping; the CLI only renders it.

const CONFIG_PATH = '.contextkit/config.yml';

const DEFAULT_CONTEXT_RULES = [
  { file: 'standards/testing.md', paths: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'] },
  { file: 'standards/code-style.md', paths: ['src/**', 'lib/**', 'app/**', 'packages/**'] },
];

function normalize(rules) {
  if (!Array.isArray(rules)) return null;
  return rules
    .filter((r) => r && typeof r.file === 'string' && r.file.trim())
    .map((r) => ({
      file: r.file.replace(/^\.contextkit\//, '').trim(),
      paths: (Array.isArray(r.paths) ? r.paths : String(r.paths || '').split(','))
        .map((p) => String(p).trim())
        .filter(Boolean),
    }))
    .filter((r) => r.paths.length > 0);
}

/**
 * Reads context_rules from config.yml. Missing key (or missing/invalid config)
 * → the defaults; an explicit empty list → no rules.
 * @param {string} [cwd]
 * @returns {{file: string, paths: string[]}[]}
 */
function readContextRules(cwd = '.') {
  const configPath = path.join(cwd, CONFIG_PATH);
  if (!fs.existsSync(configPath)) return DEFAULT_CONTEXT_RULES;
  try {
    const config = yaml.load(fs.readFileSync(configPath, 'utf-8')) || {};
    if (!Object.prototype.hasOwnProperty.call(config, 'context_rules')) {
      return DEFAULT_CONTEXT_RULES;
    }
    return normalize(config.context_rules) || [];
  } catch {
    return DEFAULT_CONTEXT_RULES;
  }
}

/** `standards/state-management-guide.md` → `state-management-guide` */
function ruleSlug(file) {
  return path
    .basename(file)
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .toLowerCase();
}

function yamlString(str) {
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function claudeRule(rule) {
  return `---
paths:
${rule.paths.map((p) => `  - ${yamlString(p)}`).join('\n')}
---

# ${ruleSlug(rule.file)} (ContextKit)

Follow \`.contextkit/${rule.file}\` when working on these files.

@.contextkit/${rule.file}
`;
}

function cursorRule(rule) {
  return `---
description: ContextKit ${ruleSlug(rule.file)} standards
globs: ${yamlString(rule.paths.join(', '))}
alwaysApply: false
---

Follow @.contextkit/${rule.file} when working on these files.
`;
}

function copilotRule(rule) {
  return `---
applyTo: ${yamlString(rule.paths.join(','))}
---

Follow \`.contextkit/${rule.file}\` when working on these files — read it before editing.
`;
}

const TARGETS = {
  claude: { dir: '.claude/rules', ext: '.md', render: claudeRule },
  cursor: { dir: '.cursor/rules', ext: '.mdc', render: cursorRule },
  copilot: { dir: '.github/instructions', ext: '.instructions.md', render: copilotRule },
};

/**
 * File paths a target would write for the given rules.
 * @param {'claude'|'cursor'|'copilot'} target
 * @param {{file: string, paths: string[]}[]} rules
 */
function ruleFiles(target, rules) {
  const { dir, ext } = TARGETS[target];
  return rules.map((rule) => `${dir}/contextkit-${ruleSlug(rule.file)}${ext}`);
}

/**
 * Writes the rule files for a target and removes contextkit-* rule files that
 * are no longer in the list. Files in `keep` (e.g. contextkit-standards.mdc)
 * are never removed.
 * @returns {Promise<string[]>} written paths
 */
async function writeContextRules(target, rules, { keep = [], cwd = '.' } = {}) {
  const { dir, ext, render } = TARGETS[target];
  const written = [];
  await fs.ensureDir(path.join(cwd, dir));
  for (const rule of rules) {
    const rel = `${dir}/contextkit-${ruleSlug(rule.file)}${ext}`;
    await fs.writeFile(path.join(cwd, rel), render(rule));
    written.push(rel);
  }

  const wanted = new Set([...written, ...keep].map((p) => path.basename(p)));
  for (const name of await fs.readdir(path.join(cwd, dir))) {
    if (name.startsWith('contextkit-') && name.endsWith(ext) && !wanted.has(name)) {
      await fs.remove(path.join(cwd, dir, name));
    }
  }
  return written;
}

module.exports = {
  DEFAULT_CONTEXT_RULES,
  readContextRules,
  ruleSlug,
  ruleFiles,
  writeContextRules,
  claudeRule,
  cursorRule,
  copilotRule,
};
