const ProjectDetector = require('../../lib/utils/project-detector');
const fs = require('fs-extra');

// Mock fs-extra
jest.mock('fs-extra');

describe('ProjectDetector', () => {
  let detector;
  let _mockPackageJson;

  beforeEach(() => {
    detector = new ProjectDetector();
    _mockPackageJson = {
      name: 'test-project',
      dependencies: {},
      devDependencies: {},
    };
    jest.clearAllMocks();
  });

  describe('detectProjectType', () => {
    test('should detect React project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        dependencies: { react: '^18.0.0' },
      });

      const result = detector.detectProjectType();
      expect(result).toBe('react');
    });

    test('should detect React with Vite', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        dependencies: { react: '^18.0.0', vite: '^4.0.0' },
      });

      const result = detector.detectProjectType();
      expect(result).toBe('react-vite');
    });

    test('should detect Vue project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        dependencies: { vue: '^3.0.0' },
      });

      const result = detector.detectProjectType();
      expect(result).toBe('vue');
    });

    test('should detect Next.js project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        dependencies: { next: '^13.0.0' },
      });

      const result = detector.detectProjectType();
      expect(result).toBe('nextjs');
    });

    test('should detect Angular project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        dependencies: { '@angular/core': '^15.0.0' },
      });

      const result = detector.detectProjectType();
      expect(result).toBe('angular');
    });

    test('should detect Node.js project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        dependencies: { express: '^4.0.0' },
      });

      const result = detector.detectProjectType();
      expect(result).toBe('node');
    });

    test('should detect Python project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'requirements.txt') return true;
        return false;
      });

      const result = detector.detectProjectType();
      expect(result).toBe('python');
    });

    test('should detect Rust project', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'Cargo.toml') return true;
        return false;
      });

      const result = detector.detectProjectType();
      expect(result).toBe('rust');
    });

    test('should return generic for unknown project', () => {
      fs.existsSync.mockReturnValue(false);

      const result = detector.detectProjectType();
      expect(result).toBe('generic');
    });
  });

  describe('detectPackageManager', () => {
    test('should detect npm', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package-lock.json') return true;
        return false;
      });

      const result = detector.detectPackageManager();
      expect(result).toBe('npm');
    });

    test('should detect yarn', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'yarn.lock') return true;
        return false;
      });

      const result = detector.detectPackageManager();
      expect(result).toBe('yarn');
    });

    test('should detect pnpm', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'pnpm-lock.yaml') return true;
        return false;
      });

      const result = detector.detectPackageManager();
      expect(result).toBe('pnpm');
    });

    test('should default to npm when only package.json exists', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      const result = detector.detectPackageManager();
      expect(result).toBe('npm');
    });

    test('should return none when no package files exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = detector.detectPackageManager();
      expect(result).toBe('none');
    });
  });

  describe('hasDependency', () => {
    test('should find dependency in dependencies', () => {
      const packageJson = {
        dependencies: { react: '^18.0.0' },
      };

      const result = detector.hasDependency(packageJson, 'react');
      expect(result).toBe('^18.0.0');
    });

    test('should find dependency in devDependencies', () => {
      const packageJson = {
        devDependencies: { jest: '^29.0.0' },
      };

      const result = detector.hasDependency(packageJson, 'jest');
      expect(result).toBe('^29.0.0');
    });

    test('should return undefined for missing dependency', () => {
      const packageJson = {
        dependencies: { react: '^18.0.0' },
      };

      const result = detector.hasDependency(packageJson, 'vue');
      expect(result).toBeUndefined();
    });
  });

  describe('readPackageJson', () => {
    test('should read and parse package.json', () => {
      const mockPackageJson = { name: 'test-project' };
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = detector.readPackageJson();
      expect(result).toEqual(mockPackageJson);
    });

    test('should return empty object on error', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = detector.readPackageJson();
      expect(result).toEqual({});
    });
  });

  describe('isGitRepository', () => {
    test('should return true when .git exists', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === '.git') return true;
        return false;
      });

      const result = detector.isGitRepository();
      expect(result).toBe(true);
    });

    test('should return false when .git does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = detector.isGitRepository();
      expect(result).toBe(false);
    });
  });

  describe('getProjectName', () => {
    test('should return name from package.json', () => {
      fs.existsSync.mockImplementation((file) => {
        if (file === 'package.json') return true;
        return false;
      });

      detector.readPackageJson = jest.fn().mockReturnValue({
        name: 'my-awesome-project',
      });

      const result = detector.getProjectName();
      expect(result).toBe('my-awesome-project');
    });

    test('should return directory name when no package.json', () => {
      fs.existsSync.mockReturnValue(false);

      const result = detector.getProjectName();
      expect(result).toBe(require('path').basename(process.cwd()));
    });
  });
});
