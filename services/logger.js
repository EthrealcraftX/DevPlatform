const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');

// === Log papkasini yaratish
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// === Log yozish funksiyasi
function appendLog(projectId, message) {
  const logPath = path.join(logDir, `${projectId}.log`);
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, line, 'utf-8');
}

// === Log faylni tozalash (foydalanuvchidan so‘ralgan bo‘lsa)
function clearLog(projectId) {
  const logPath = path.join(logDir, `${projectId}.log`);
  if (fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '', 'utf-8');
  }
}

module.exports = {
  appendLog,
  clearLog
};