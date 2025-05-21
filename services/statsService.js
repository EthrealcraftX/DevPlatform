const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

// === MB hisoblash funksiyasi
function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

// === Papka hajmini hisoblash (rekursiv)
function calculateFolderSize(dirPath) {
  let total = 0;

  if (!fs.existsSync(dirPath)) return 0;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      total += calculateFolderSize(fullPath);
    } else if (item.isFile()) {
      const stats = fs.statSync(fullPath);
      total += stats.size;
    }
  }

  return total;
}

// === Public: Get disk usage of project (in MB)
function getDiskUsage(projectId) {
  const projectPath = path.join(uploadsDir, projectId);
  const totalBytes = calculateFolderSize(projectPath);
  return bytesToMB(totalBytes);
}

module.exports = {
  getDiskUsage
};