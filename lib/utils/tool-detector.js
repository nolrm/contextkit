const fs = require('fs-extra');
const { execSync } = require('child_process');

class ToolDetector {
  constructor() {
    this.detectedTools = null;
  }

  /**
   * Detect all available AI tools in the environment
   * @returns {Promise<Object>} Object with detected tools and their status
   */
  async detectAll() {
    if (this.detectedTools) {
      return this.detectedTools;
    }

    this.detectedTools = {
      // Editor integrations (check for directories/config files)
      cursor: await this.detectCursor(),
      continue: await this.detectContinue(),
      aider: await this.detectAider(),
      vscode: await this.detectVSCode(),
      jetbrains: await this.detectJetBrains(),
      windsurf: await this.detectWindsurf(),

      // CLI tools (check if command exists in PATH)
      aider_cli: await this.detectCLITool('aider'),
      claude_cli: await this.detectCLITool('claude'),
      gemini_cli: await this.detectCLITool('gemini'),
      codex_cli: await this.detectCLITool('codex'),
      opencode_cli: await this.detectCLITool('opencode'),
    };

    return this.detectedTools;
  }

  /**
   * Get summary of detected tools
   */
  getSummary() {
    if (!this.detectedTools) return null;

    const detected = Object.entries(this.detectedTools)
      .filter(([_, isDetected]) => isDetected)
      .map(([tool, _]) => tool);

    const editors = detected.filter((t) =>
      ['cursor', 'continue', 'aider', 'vscode', 'jetbrains', 'windsurf'].includes(t)
    );
    const cli = detected.filter((t) => t.endsWith('_cli'));

    return {
      all: detected,
      editors,
      cli,
      count: detected.length,
    };
  }

  async detectCursor() {
    // Check for Cursor in multiple locations
    const paths = ['.cursor/rules', '.cursor', `${process.env.HOME}/.cursor`];

    for (const path of paths) {
      if (await fs.pathExists(path)) {
        return true;
      }
    }
    return false;
  }

  async detectContinue() {
    return await fs.pathExists('.continue');
  }

  async detectAider() {
    // Check if .aider directory exists or if aider is in PATH
    return (await fs.pathExists('.aider')) || (await this.detectCLITool('aider'));
  }

  async detectVSCode() {
    return await fs.pathExists('.vscode');
  }

  async detectJetBrains() {
    return await fs.pathExists('.idea');
  }

  async detectWindsurf() {
    return (await fs.pathExists('.windsurf')) || (await fs.pathExists('.windsurfrules'));
  }

  /**
   * Detect if a CLI tool is available in PATH
   */
  async detectCLITool(toolName) {
    try {
      execSync(`which ${toolName}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get recommended integration priority
   */
  getRecommendedOrder(detected) {
    // Prioritize: Editors with good integration, then CLI tools
    const priority = [
      'cursor', // Already fully supported
      'continue', // Great integration, multi-editor
      'aider', // Agentic, powerful
      'windsurf', // New, promising
      'vscode', // Widely used
      'jetbrains', // Enterprise
      'aider_cli', // CLI with auto-rules
      'claude_cli', // Good CLI
      'gemini_cli', // Alternative CLI
      'codex_cli', // OpenAI Codex CLI
      'opencode_cli', // OpenCode CLI
    ];

    return priority.filter((tool) => detected[tool]);
  }

  /**
   * Check if specific tool is detected
   */
  async isDetected(toolName) {
    const detected = await this.detectAll();
    return detected[toolName] || false;
  }
}

module.exports = ToolDetector;
