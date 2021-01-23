const path = require('path');
const fs = require('fs').promises;

const getFilesRecursively = async (directory, fileExtension) => {
  if (directory.includes('node_modules')) {
    return;
  }

  let files = await fs.readdir(directory);
  files = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        return getFilesRecursively(filePath, fileExtension);
      } else if (stats.isFile() && path.extname(filePath) === fileExtension) {
        return filePath;
      }
    }),
  );

  return files
    .reduce((all, folderContents) => all.concat(folderContents), [])
    .filter(Boolean);
};

module.exports = { getFilesRecursively };
