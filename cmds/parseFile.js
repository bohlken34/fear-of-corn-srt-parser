const path = require('path');
const fs = require('fs').promises;
const parseSRT = require('parse-srt');
const error = require('../utils/error');
const ora = require('ora');
const { getFilesRecursively } = require('../utils/fileGetter');
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
    return subs.map(sub => ({
        "Name": String(sub.id),
        "Delay -n": sub.start.toFixed(3),
        "Speaker": outputSpeaker,
        "Subtitle Text": sub.text,
        "bCaption": false
    }));
}

async function getSrtFiles(dir) {
    let files = await fs.readdir(dir);
    files = await Promise.all(
      files.map(async (file) => {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          if (stats.isFile() && path.extname(filePath) === '.srt') {
              return filePath;
          }
      })
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
      JSON.stringify(focSubs)
    );
}

module.exports = async (args) => {
    const spinner = ora().start();

    const file = args.file || args.f;
    const all = args.all || args.a;
    const recursive = args.recursive || args.r;
    const speaker = args.speaker || args.s;

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
        } catch (e) {
            spinner.stop();
            error(colors.error(e), true);
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
            } catch (e) {
                spinner.stop();
                error(e, true);
            }
        }

        console.log(colors.green('success ✅  Done!'));
        process.exit(1);
    }
};
