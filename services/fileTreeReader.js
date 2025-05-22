const fs = require('fs');
const path = require('path');

/**
 * Fayl daraxtini rekursiv tarzda o‘qish
 * @param {string} dir - uploads/... katalogi
 * @param {string} rel - frontendga uzatiladigan nisbiy path
 * @returns {Array} file tree
 */
function readFileTree(dir, rel = '') {
  if (!fs.existsSync(dir)) return [];

  const items = fs.readdirSync(dir);
  return items.map(name => {
    const fullPath = path.join(dir, name);
    const relPath = path.join(rel, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      return {
        type: 'folder',
        name,
        path: relPath,
        children: readFileTree(fullPath, relPath)
      };
    } else {
      return {
        type: 'file',
        name,
        path: relPath
      };
    }
  });
}

/**
 * Flatten qilish uchun yordamchi
 * @param {Array} tree - fayl daraxti
 * @returns {Array} flat file list
 */
function flattenFiles(tree) {
  let result = [];
  for (const item of tree) {
    if (item.type === 'file') {
      result.push(item);
    } else if (item.type === 'folder') {
      result = result.concat(flattenFiles(item.children));
    }
  }
  return result;
}

module.exports = {
  readFileTree,
  flattenFiles
};
