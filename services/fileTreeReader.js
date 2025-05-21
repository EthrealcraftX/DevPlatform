const fs = require('fs');
const path = require('path');

/**
 * Upload qilingan fayllarni rekursiv tarzda daraxt ko‘rinishida qaytaradi
 * @param {string} dirPath - uploads/{projectId}
 * @param {string} rel - nisbiy yo‘l frontend uchun
 * @returns {Array} fayl daraxti
 */
function readFileTree(dirPath, rel = '') {
  if (!fs.existsSync(dirPath)) return [];

  const structure = [];

  for (const name of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, name);
    const relativePath = path.join(rel, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      structure.push({
        type: 'folder',
        name,
        path: relativePath,
        children: readFileTree(fullPath, relativePath)
      });
    } else {
      structure.push({
        type: 'file',
        name,
        path: relativePath
      });
    }
  }

  return structure;
}

module.exports = { readFileTree };
