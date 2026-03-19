const install = require('./commands/install');
const update = require('./commands/update');
const status = require('./commands/status');
const GatesCommand = require('./commands/gates');

module.exports = {
  install,
  update,
  status,
  gates: GatesCommand,
};
