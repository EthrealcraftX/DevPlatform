const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const runningProcesses = {};
const pidFile = path.join(__dirname, '..', 'storage', 'pids.json');

// ---- PID saqlash
function savePIDs() {
  fs.writeFileSync(pidFile, JSON.stringify(runningProcesses, null, 2));
}

// ---- PID yuklash
function loadPIDs() {
  if (!fs.existsSync(pidFile)) return;

  const data = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
  for (const id in data) {
    const pid = data[id];
    try {
      process.kill(pid, 0); // tirikligini tekshiradi
      runningProcesses[id] = pid;
    } catch {
      // o‘lik pid -> o‘tkazamiz
    }
  }

  console.log(`📁 PIDs loaded: ${Object.keys(runningProcesses).length} ta`);
}

// ---- Projectni ishga tushirish
function runProject(id) {
  const projectPath = path.join(__dirname, '..', 'projects', id);
  const indexPath = path.join(projectPath, 'index.js');

  if (!fs.existsSync(indexPath)) {
    return { success: false, message: `index.js topilmadi: ${indexPath}` };
  }

  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const logPath = path.join(logDir, `${id}.log`);
  const out = fs.openSync(logPath, 'a');

  const child = spawn('node', ['index.js'], {
    cwd: projectPath,
    detached: true,
    stdio: ['ignore', out, out],
  });

  child.unref();
  runningProcesses[id] = child.pid;
  savePIDs();

  console.log(`✅ Project ${id} ishga tushdi. PID: ${child.pid}`);
  return { success: true, pid: child.pid };
}

// ---- Projectni to‘xtatish
function stopProject(id) {
  const pid = runningProcesses[id];
  if (!pid) {
    console.warn(`⚠️ Project ${id} uchun PID topilmadi`);
    return { success: false, message: 'PID topilmadi' };
  }

  try {
    process.kill(pid, 'SIGTERM');
    delete runningProcesses[id];
    savePIDs();
    console.log(`⏹️ Project ${id} to‘xtatildi`);
    return { success: true };
  } catch (err) {
    console.error(`❌ To‘xtatishda xatolik: ${err.message}`);
    return { success: false, message: err.message };
  }
}

// ---- Holatni aniqlash
function getStatus(id) {
  return runningProcesses[id] ? 'running' : 'stopped';
}

// ---- Export
module.exports = {
  runProject,
  stopProject,
  getStatus,
  savePIDs,
  loadPIDs,
};
