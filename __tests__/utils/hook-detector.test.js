const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const HookDetector = require('../../lib/utils/hook-detector');

jest.mock('chalk', () => ({
  red: (s) => s,
  green: (s) => s,
  yellow: (s) => s,
  blue: (s) => s,
  bold: (s) => s,
  cyan: (s) => s,
  dim: (s) => s,
}));

describe('HookDetector', () => {
  let tmpDir;
  let originalCwd;
  let detector;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-hookdetector-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    detector = new HookDetector();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
    jest.restoreAllMocks();
  });

  // ── Node.js detection ──────────────────────────────────────────────────────

  it('1. returns null when no project files exist', async () => {
    const result = await detector.detect(tmpDir);
    expect(result).toBeNull();
  });

  it('2. returns pnpm format+lint command for pnpm project with both scripts', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { format: 'prettier --write .', lint: 'eslint .' },
    });
    await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('pnpm run format && pnpm run lint --fix 2>&1 | tail -20');
  });

  it('3. returns yarn lint:fix command when only lint:fix script present', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { 'lint:fix': 'eslint . --fix' },
    });
    await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('yarn lint:fix 2>&1 | tail -20');
  });

  it('4. returns npm lint --fix command when only lint script present (no :fix variant)', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { lint: 'eslint .' },
    });
    await fs.writeFile(path.join(tmpDir, 'package-lock.json'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('npm run lint -- --fix 2>&1 | tail -20');
  });

  it('5. returns format-only command when only format script present', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { format: 'prettier --write .' },
    });
    await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('pnpm run format 2>&1 | tail -20');
  });

  it('6. returns null when package.json has empty scripts block', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { scripts: {} });
    const result = await detector.detect(tmpDir);
    expect(result).toBeNull();
  });

  it('7. returns null when package.json is malformed JSON', async () => {
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{ invalid json }');
    const result = await detector.detect(tmpDir);
    expect(result).toBeNull();
  });

  it('8. detects bun package manager from bun.lockb', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { format: 'prettier --write .' },
    });
    await fs.writeFile(path.join(tmpDir, 'bun.lockb'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('bun run format 2>&1 | tail -20');
  });

  it('9. detects yarn over npm when yarn.lock present', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { 'lint:fix': 'eslint --fix .' },
    });
    await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toContain('yarn lint:fix');
  });

  it('10. prefer lint:fix over lint when both scripts exist', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { 'lint:fix': 'eslint --fix .', lint: 'eslint .' },
    });
    await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    const result = await detector.detect(tmpDir);
    expect(result).toContain('lint:fix');
    expect(result).not.toContain('lint --fix');
  });

  // ── Go detection ───────────────────────────────────────────────────────────

  it('11. returns null for Go project when neither gofmt nor golangci-lint available', async () => {
    await fs.writeFile(path.join(tmpDir, 'go.mod'), 'module example\n\ngo 1.21\n');
    // Mock _commandExists to return false for all
    jest.spyOn(detector, '_commandExists').mockReturnValue(false);
    const result = await detector.detect(tmpDir);
    expect(result).toBeNull();
  });

  it('12. returns gofmt command for Go project when only gofmt available', async () => {
    await fs.writeFile(path.join(tmpDir, 'go.mod'), 'module example\n\ngo 1.21\n');
    jest.spyOn(detector, '_commandExists').mockImplementation((name) => name === 'gofmt');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('gofmt -w .');
  });

  it('13. returns combined gofmt+golangci-lint command when both available', async () => {
    await fs.writeFile(path.join(tmpDir, 'go.mod'), 'module example\n\ngo 1.21\n');
    jest.spyOn(detector, '_commandExists').mockReturnValue(true);
    const result = await detector.detect(tmpDir);
    expect(result).toContain('gofmt -w .');
    expect(result).toContain('golangci-lint run');
  });

  // ── Python detection ───────────────────────────────────────────────────────

  it('14. returns null for Python project when neither black nor ruff available', async () => {
    await fs.writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.black]\n');
    jest.spyOn(detector, '_commandExists').mockReturnValue(false);
    const result = await detector.detect(tmpDir);
    expect(result).toBeNull();
  });

  it('15. returns black command for Python project when only black available', async () => {
    await fs.writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.black]\n');
    jest.spyOn(detector, '_commandExists').mockImplementation((name) => name === 'black');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('black .');
  });

  it('16. returns ruff command for Python project detected via requirements.txt', async () => {
    await fs.writeFile(path.join(tmpDir, 'requirements.txt'), 'flask\n');
    jest.spyOn(detector, '_commandExists').mockImplementation((name) => name === 'ruff');
    const result = await detector.detect(tmpDir);
    expect(result).toBe('ruff check --fix . 2>&1 | tail -20');
  });

  it('17. returns combined black+ruff command when both available', async () => {
    await fs.writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.black]\n');
    jest.spyOn(detector, '_commandExists').mockReturnValue(true);
    const result = await detector.detect(tmpDir);
    expect(result).toContain('black .');
    expect(result).toContain('ruff check --fix');
  });

  // ── Priority / fallthrough ─────────────────────────────────────────────────

  it('18. Node.js takes priority over Go when both markers present', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { format: 'prettier --write .' },
    });
    await fs.writeFile(path.join(tmpDir, 'go.mod'), 'module example\n\ngo 1.21\n');
    jest.spyOn(detector, '_commandExists').mockReturnValue(true);
    const result = await detector.detect(tmpDir);
    expect(result).toContain('format');
    expect(result).not.toContain('gofmt');
  });

  it('19. uses process.cwd() when projectDir is omitted', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      scripts: { 'lint:fix': 'eslint --fix .' },
    });
    await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');
    // tmpDir is already cwd from beforeEach
    const result = await detector.detect();
    expect(result).toBe('yarn lint:fix 2>&1 | tail -20');
  });
});
