const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class DownloadManager {
  constructor() {
    this.timeout = 30000; // 30 seconds
    this.retries = 3;
  }

  async downloadFile(url, outputPath, retryCount = 0) {
    try {
      // Ensure directory exists
      await fs.ensureDir(path.dirname(outputPath));

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: this.timeout,
        headers: {
          'User-Agent': 'contextkit-cli/1.0.0',
        },
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      if (retryCount < this.retries) {
        console.log(`Retrying download (${retryCount + 1}/${this.retries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.downloadFile(url, outputPath, retryCount + 1);
      }
      throw new Error(`Failed to download ${url}: ${error.message}`);
    }
  }

  async downloadMultiple(files) {
    const promises = files.map(({ url, path }) => this.downloadFile(url, path));
    return Promise.all(promises);
  }
}

module.exports = DownloadManager;
