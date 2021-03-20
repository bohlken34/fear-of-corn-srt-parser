const fs = require('fs').promises;
const error = require('../utils/error');
const { getFilesRecursively } = require('../utils/file-getter');
const { subtract, format } = require('mathjs');
const colors = require('colors/safe');
const isIterable = require('../utils/is-iterable');
let errorCount = 0;
let filesWithErrors = [];

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

function checkLength(fileObject, maxLength, fileName) {
  for (const subTitle of fileObject) {
    const textToParse = subTitle['Subtitle Text'];
    const subLength = textToParse.length;
    if (subLength > maxLength) {
      error(
        colors.warn(`[warning] 🍆  `) +
          `Subtitle ${subTitle['Name']} contains ${subLength} characters and is too long.`.padEnd(
            55,
          ) +
          '😏',
      );
      errorCount++;

      if (!filesWithErrors.includes(fileName)) {
        filesWithErrors.push(fileName);
      }
    }

    if (testWhiteSpace(textToParse.charAt(0))) {
      error(
        colors.warn(`[warning] ➡️   `) +
          `Subtitle ${subTitle['Name']} has a whitespace character at the beginning.`,
      );
      errorCount++;

      if (!filesWithErrors.includes(fileName)) {
        filesWithErrors.push(fileName);
      }
    }

    if (testWhiteSpace(textToParse.slice(-1))) {
      error(
        colors.warn(`[warning] ⬅️   `) +
          `Subtitle ${subTitle['Name']} has a whitespace character at the end.`,
      );
      errorCount++;

      if (!filesWithErrors.includes(fileName)) {
        filesWithErrors.push(fileName);
      }
    }
  }
}

const testWhiteSpace = (x) => {
  const whiteRegex = new RegExp(/^\s$/);
  return whiteRegex.test(x.charAt(0));
};

function checkInterval(fileObject, minInterval, fileName) {
  for (let index = 0; index < fileObject.length; index++) {
    if (index === 0) {
      continue;
    }

    const currentTime = Number.parseFloat(fileObject[index]['Delay -n']);
    const previousTime = Number.parseFloat(fileObject[index - 1]['Delay -n']);

    const diff = subtract(currentTime, previousTime);
    const formattedDiff = Number.parseFloat(format(diff, { precision: 14 }));
    if (formattedDiff < minInterval) {
      error(
        colors.warn(`[warning] ⏰  `) +
          `Interval between subtitles ${fileObject[index - 1]['Name']} and ${
            fileObject[index]['Name']
          } is ${formattedDiff}s`,
      );
      errorCount++;

      if (!filesWithErrors.includes(fileName)) {
        filesWithErrors.push(fileName);
      }
    }
  }
}

module.exports = async (arguments_) => {
  const maxChars = Number(arguments_.maxChar || arguments_.c);
  const minInterval = Number(arguments_.interval || arguments_.i);
  const hideSkipped = Boolean(arguments_.hideSkipped || arguments_.s);

  let hasError = false;
  if (!maxChars) {
    error(
      colors.error(
        'You must specify a max number of characters using --maxChar or -c.',
      ),
    );
    hasError = true;
  }

  if (!minInterval) {
    error(
      colors.error(
        'You must specify a minimum interval between subtitles using --interval or -i.',
      ),
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

      if (!isIterable(fileObject)) {
        if (!hideSkipped) {
          console.log(colors.dim(`[skipped]     === ${file} ===`));
        }
        continue;
      } else {
        console.log(colors.dim(`=== ${file} ===`));
      }
      checkLength(fileObject, maxChars, file);
      checkInterval(fileObject, minInterval, file);
    } catch (error_) {
      error(colors.error(error_), true);
    }
  }

  const fileTotal = files.length;

  console.log(colors.green(`[success] ✅  Done! ${fileTotal} files checked.`));

  if (errorCount > 0) {
    console.log(
      '\n' +
        colors.red(`${errorCount} errors `) +
        colors.white(`in ${filesWithErrors.length} files:`),
    );
    console.log(colors.red(filesWithErrors.join('\n') + '\n'));
  }

  process.exit(1);
};
