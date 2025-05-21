const path = require('path');
const { spawn } = require('child_process');
const { appendLog } = require('./logger');

// Barcha processlarni saqlovchi object
const __internal = {};

// === Command generator ===
function getCommand(type, filePath) {
  switch (type) {
    case 'nodejs':
      return ['node', [filePath]];
    case 'python':
      return ['python', [filePath]];
    case 'java':
      return ['java', ['-jar', filePath]];
    default:
      throw new Error(`Unknown project type: ${type}`);
  }
}

// === Projectni start qilish ===
function start(project) {
  if (!project || !project.id || !project.main || !project.type) {
    console.error('[runner] Invalid project data:', project);
    return { status: 'invalid' };
  }

  // Allaqachon ishga tushgan bo‘lsa
  if (__internal[project.id]) {
    return { status: 'already_running' };
  }

  const projectDir = path.join(__dirname, '..', 'uploads', project.id);
  const mainFilePath = path.join(projectDir, project.main); // To‘liq fayl yo‘li
  const [cmd, args] = getCommand(project.type, mainFilePath);

  const proc = spawn(cmd, args, {
    cwd: projectDir,
    shell: false
  });

  __internal[project.id] = proc;

  // === Output ===
  proc.stdout.on('data', data => {
    const out = `[OUT] ${data}`;
    appendLog(project.id, out);
    proc.emit('console', out);
  });

  // === Error ===
  proc.stderr.on('data', data => {
    const err = `[ERR] ${data}`;
    appendLog(project.id, err);
    proc.emit('console', err);
  });

  // === Process tugaganda ===
  proc.on('exit', code => {
    const end = `[EXIT] Process finished with code ${code}`;
    appendLog(project.id, end);
    proc.emit('console', end);
    delete __internal[project.id];
  });

  return { status: 'started' };
}

// === Projectni stop qilish ===
function stop(projectId) {
  const proc = __internal[projectId];
  if (!proc) return { status: 'not_running' };

  proc.kill();
  delete __internal[projectId];
  return { status: 'stopped' };
}

// === Ishlayaptimi tekshirish ===
function isRunning(projectId) {
  return !!__internal[projectId];
}

// === Foydalanuvchi yozgan buyruqni yuborish ===
function sendCommand(projectId, input) {
  const proc = __internal[projectId];
  if (proc && proc.stdin.writable) {
    proc.stdin.write(input + '\n');
    appendLog(projectId, `> ${input}`);
  }
}

module.exports = {
  start,
  stop,
  isRunning,
  sendCommand,
  __internal // socketManager uchun
};
