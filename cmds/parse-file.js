const path = require('path');
const fs = require('fs').promises;
const parseSRT = require('parse-srt');
const error = require('../utils/error');
const ora = require('ora');
const { getFilesRecursively } = require('../utils/file-getter');
const colors = require('colors/safe');

colors.setTheme({
  warn: 'yellow',
  success: 'green',
  file: 'cyan',
  error: 'red',
});

function massageData(subs, speaker) {
  let outputSpeaker = 'Valerie';

  if (typeof speaker === 'string') {
    outputSpeaker = speaker;
  }
  return subs.map((sub) => ({
    Name: String(sub.id),
    'Delay -n': sub.start.toFixed(3),
    Speaker: outputSpeaker,
    'Subtitle Text': sub.text,
    bCaption: false,
  }));
}

async function getSrtFiles(directory) {
  let files = await fs.readdir(directory);
  files = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile() && path.extname(filePath) === '.srt') {
        return filePath;
      }
    }),
  );

  return files
    .reduce((all, folderContents) => all.concat(folderContents), [])
    .filter(Boolean);
}

async function convertFileToJSON(filePath, speaker) {
  const fileContents = await fs.readFile(filePath, 'utf8');

  const subs = parseSRT(fileContents);
  const focSubs = massageData(subs, speaker);

  const fileName = path.basename(filePath, path.extname(filePath));

  await fs.writeFile(
    `${path.dirname(filePath)}/${fileName}.json`,
    JSON.stringify(focSubs),
  );
}

module.exports = async (arguments_) => {
  const spinner = ora().start();

  const file = arguments_.file || arguments_.f;
  const all = arguments_.all || arguments_.a;
  const recursive = arguments_.recursive || arguments_.r;
  const speaker = arguments_.speaker || arguments_.s;

  if (file && (all || recursive)) {
    spinner.stop();
    error(colors.error("You can't use --file with --all or --recursive"), true);
  }

  if (recursive && !all) {
    spinner.stop();
    error(colors.error("You can't use --recursive without --all"), true);
  }

  if (file) {
    try {
      await convertFileToJSON(file, speaker);
    } catch (error_) {
      spinner.stop();
      error(colors.error(error_), true);
    }

    spinner.stop();
    console.log(colors.green('success ✅  Done!'));
    process.exit(1);
  }

  if (all) {
    const files = recursive
      ? await getFilesRecursively(process.cwd(), '.srt')
      : await getSrtFiles(process.cwd());

    console.log(files);

    for (const file of files) {
      try {
        await convertFileToJSON(file, speaker);
      } catch (error_) {
        spinner.stop();
        error(error_, true);
      }
    }

    console.log(colors.green('success ✅  Done!'));
    process.exit(1);
  }
};
