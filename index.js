const minimist = require('minimist');
const error = require('./utils/error');

module.exports = () => {
  const arguments_ = minimist(process.argv.slice(2));
  let cmd = arguments_._[0] || 'help';

  if (arguments_.version || arguments_.v) {
    cmd = 'version';
  }

  if (arguments_.help || arguments_.h) {
    cmd = 'help';
  }

  switch (cmd) {
    case 'parse':
      require('./cmds/parse-file')(arguments_);
      break;
    case 'check':
      require('./cmds/error-check')(arguments_);
      break;
    case 'version':
      require('./cmds/version')(arguments_);
      break;
    case 'help':
      require('./cmds/help')(arguments_);
      break;
    default:
      error(`"${cmd}" is not a valid command!`, true);
      break;
  }
};
