const fs = require('fs').promises;
const error = require('../utils/error');
const ora = require('ora');
const { getFilesRecursively } = require('../utils/fileGetter');
const { subtract, format } = require('mathjs');
const colors = require('colors/safe');

colors.setTheme({
  warn: 'yellow',
  success: 'green',
  file: 'cyan',
  error: 'red',
});

async function getJsonObjectFromFile(filePath) {
  const fileContents = await fs.readFile(filePath, 'utf8');

  return await JSON.parse(fileContents);
}

function checkLength(fileObject, maxLength, filePath) {
  for (const subTitle of fileObject) {
    const subLength = subTitle['Subtitle Text'].length;
    if (subLength > maxLength) {
      console.log(`[${filePath}]\n`);
      error(
        colors.warn(
          `Length warning: Subtitle ${subTitle['Name']} contains ${subLength} characters.\n`
        )
      );
    }
  }
}

function checkInterval(fileObject, minInterval, filePath) {
  for (let i = 0; i < fileObject.length; i++) {
    if (i === 0) {
      continue;
    }

    const currentTime = parseFloat(fileObject[i]['Delay -n']);
    const previousTime = parseFloat(fileObject[i - 1]['Delay -n']);

    const diff = subtract(currentTime, previousTime);
    const formattedDiff = parseFloat(format(diff, { precision: 14 }));
    if (formattedDiff > minInterval) {
      console.log(`[${filePath}]\n`);
      error(
        colors.warn(
          `Time warning: Interval between Subtitles ${
            i - 1
          } and ${i} is ${formattedDiff}s`
        )
      );
    }
  }
}

module.exports = async (args) => {
  const spinner = ora().start();

  const maxChars = Number(args.maxChar || args.c);
  const minInterval = Number(args.interval || args.i);

  let hasError = false;
  if (!maxChars) {
    error(
      colors.error(
        'You must specify a max number of characters using --maxChar or -c.'
      )
    );
    hasError = true;
  }

  if (!minInterval) {
    error(
      colors.error(
        'You must specify a minimum interval between subtitles using --interval or -i.'
      )
    );
    hasError = true;
  }

  if (hasError) {
    process.exit(1);
  }

  const files = await getFilesRecursively(process.cwd(), '.json');

  for (const file of files) {
    try {
      const fileObject = await getJsonObjectFromFile(file);
      checkLength(fileObject, maxChars, file);
      checkInterval(fileObject, minInterval, file);
    } catch (e) {
      spinner.stop();
      error(colors.error(e), true);
    }
  }

  console.log(colors.trap('Done!'));
};
