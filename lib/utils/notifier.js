const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');

/**
 * Check for available updates to @nolrm/contextkit on npm.
 * Results are cached for 24 hours. Notification prints after the command
 * completes. Suppressed automatically in CI environments.
 */
function checkForUpdates() {
  try {
    updateNotifier({ pkg }).notify();
  } catch (err) {
    // Never crash the CLI due to a notifier failure
  }
}

module.exports = { checkForUpdates };
