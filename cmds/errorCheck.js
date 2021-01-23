const fs = require('fs').promises;
const error = require('../utils/error');
const ora = require('ora');
const { getFilesRecursively } = require('../utils/fileGetter');
const { subtract, format } = require('mathjs');
const colors = require('colors/safe');
const isIterable = require('../utils/isIterable');

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

function checkLength(fileObject, maxLength) {
  for (const subTitle of fileObject) {
    const textToParse = subTitle['Subtitle Text'];
    const subLength = textToParse.length;
    if (subLength > maxLength) {
      error(
        colors.warn(
          `[warning] 🍆  `) + `Subtitle ${subTitle['Name']} contains ${subLength} characters and is too long.  😏`
      );
    }

    if (testWhiteSpace(textToParse.charAt(0))) {
      error(
        colors.warn(
          `[warning] ➡️   `) + `Subtitle ${subTitle['Name']} has a whitespace character at the beginning.`
      );
    }

    if (testWhiteSpace(textToParse.slice(-1))) {
      error(
        colors.warn(
          `[warning] ⬅️   `) + `Subtitle ${subTitle['Name']} has a whitespace character at the end.`
      );
    }
  }
}

const testWhiteSpace = x => {
  const whiteRegex = new RegExp(/^\s$/);
  return whiteRegex.test(x.charAt(0));
}

function checkInterval(fileObject, minInterval) {
  for (let i = 0; i < fileObject.length; i++) {
    if (i === 0) {
      continue;
    }

    const currentTime = parseFloat(fileObject[i]['Delay -n']);
    const previousTime = parseFloat(fileObject[i - 1]['Delay -n']);

    const diff = subtract(currentTime, previousTime);
    const formattedDiff = parseFloat(format(diff, { precision: 14 }));
    if (formattedDiff < minInterval) {
      error(
        colors.warn(
          `[warning] ⏰  `) + `Interval between subtitles ${
            fileObject[i - 1]['Name']
          } and ${fileObject[i]['Name']} is ${formattedDiff}s`
      );
    }
  }
}

module.exports = async (args) => {
  const maxChars = Number(args.maxChar || args.c);
  const minInterval = Number(args.interval || args.i);
  const hideSkipped = Boolean(args.hideSkipped || args.s);

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

  for (let i = 0; i < files.length; i++) {
    try {
      const fileObject = await getJsonObjectFromFile(files[i]);

      if (!isIterable(fileObject)) {
        if (!hideSkipped) {
          console.log(colors.dim(`[skipped]     === ${files[i]} ===`));
        }
        continue;
      } else {
        console.log(colors.dim(`=== ${files[i]} ===`));
      }
      checkLength(fileObject, maxChars);
      checkInterval(fileObject, minInterval);
    } catch (e) {
      error(colors.error(e), true);
    }
  }

  console.log(colors.green('[success] ✅  Done!'));
  process.exit(1);
};
