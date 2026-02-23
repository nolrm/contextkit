const ClaudeIntegration = require('./claude-integration');
const CursorIntegration = require('./cursor-integration');
const CopilotIntegration = require('./copilot-integration');
const CodexIntegration = require('./codex-integration');
const OpencodeIntegration = require('./opencode-integration');
const GeminiIntegration = require('./gemini-integration');
const AiderIntegration = require('./aider-integration');
const ContinueIntegration = require('./continue-integration');
const WindsurfIntegration = require('./windsurf-integration');

const INTEGRATIONS = {
  claude: ClaudeIntegration,
  cursor: CursorIntegration,
  copilot: CopilotIntegration,
  vscode: CopilotIntegration, // backward compat alias
  codex: CodexIntegration,
  opencode: OpencodeIntegration,
  gemini: GeminiIntegration,
  aider: AiderIntegration,
  continue: ContinueIntegration,
  windsurf: WindsurfIntegration,
};

function getIntegration(name) {
  const IntegrationClass = INTEGRATIONS[name];
  if (!IntegrationClass) return null;
  return new IntegrationClass();
}

function getAllIntegrationNames() {
  // Return unique names (exclude aliases like vscode)
  return ['claude', 'cursor', 'copilot', 'codex', 'opencode', 'gemini', 'aider', 'continue', 'windsurf'];
}

module.exports = { getIntegration, getAllIntegrationNames, INTEGRATIONS };
