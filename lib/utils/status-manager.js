const fs = require('fs-extra');

class StatusManager {
  constructor() {
    this.statusPath = '.contextkit/status.json';
  }

  async getStatus() {
    try {
      if (await fs.pathExists(this.statusPath)) {
        return await fs.readJson(this.statusPath);
      }
    } catch (error) {
      console.warn('Warning: Could not read status file:', error.message);
    }
    return this.getDefaultStatus();
  }

  getDefaultStatus() {
    const packageJson = require('../../package.json');
    return {
      version: packageJson.version,
      installed_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      analyze: {
        run: false,
        last_run: null,
        customizations: [],
        project_type: null,
        package_manager: null,
      },
      features: {
        pre_push_hook: false,
        commit_msg_hook: false,
        standards: true,
        templates: true,
      },
    };
  }

  async saveStatus(status) {
    try {
      await fs.ensureDir('.contextkit');
      await fs.writeJson(this.statusPath, status, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save status: ${error.message}`);
    }
  }

  async updateAnalyzeStatus(analyzeData) {
    const status = await this.getStatus();
    status.analyze = {
      run: true,
      last_run: new Date().toISOString(),
      customizations: analyzeData.customizations || [],
      project_type: analyzeData.project_type,
      package_manager: analyzeData.package_manager,
    };
    status.last_updated = new Date().toISOString();
    await this.saveStatus(status);
  }

  async updateFeatureStatus(feature, enabled) {
    const status = await this.getStatus();
    status.features[feature] = enabled;
    status.last_updated = new Date().toISOString();
    await this.saveStatus(status);
  }

  async isFirstTimeAnalyze() {
    const status = await this.getStatus();
    return !status.analyze.run;
  }

  async getAnalyzeInfo() {
    const status = await this.getStatus();
    return {
      isFirstTime: !status.analyze.run,
      lastRun: status.analyze.last_run,
      projectType: status.analyze.project_type,
      packageManager: status.analyze.package_manager,
      customizations: status.analyze.customizations,
    };
  }

  async updateVersion(version) {
    const status = await this.getStatus();
    status.version = version;
    status.last_updated = new Date().toISOString();
    await this.saveStatus(status);
  }

  async resetAnalyzeStatus() {
    const status = await this.getStatus();
    status.analyze = {
      run: false,
      last_run: null,
      customizations: [],
      project_type: null,
      package_manager: null,
    };
    status.last_updated = new Date().toISOString();
    await this.saveStatus(status);
  }
}

module.exports = StatusManager;
