const path = require('path');
const fs = require('fs').promises;

const getFilesRecursively = async (dir, fileExt) => {
  let files = await fs.readdir(dir);
  files = await Promise.all(files.map(async file => {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return getFilesRecursively(filePath, fileExt);
    } else if (stats.isFile() && path.extname(filePath) === fileExt) {
      return filePath;
    }
  }));

  return files
    .reduce((all, folderContents) => all.concat(folderContents), [])
    .filter( Boolean );
}

module.exports = { getFilesRecursively };
