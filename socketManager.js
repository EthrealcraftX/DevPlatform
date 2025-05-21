const { __internal } = require('./services/runner');
const { getDiskUsage } = require('./services/statsService');
const { appendLog } = require('./services/logger');
const { getProjectMeta } = require('./services/utils');

module.exports = function(io) {
  // === LOGS (read-only output)
  io.of(/^\/project-log\/.+$/).on('connection', socket => {
    const projectId = socket.nsp.name.split('/').pop();
    const proc = __internal[projectId];

    if (proc) {
      const listener = data => socket.emit('console', data.toString());
      proc.on('console', listener);

      socket.on('disconnect', () => {
        proc.off('console', listener);
      });
    }
  });

  // === CONSOLE (write input to process)
  io.of(/^\/project-console\/.+$/).on('connection', socket => {
    const projectId = socket.nsp.name.split('/').pop();
    const proc = __internal[projectId];

    socket.on('consoleInput', input => {
      if (proc && proc.stdin.writable) {
        proc.stdin.write(input + '\n');
        appendLog(projectId, `> ${input}`);
      }
    });
  });

  // === STATS (live disk + fake internet speed)
  io.of('/stats').on('connection', socket => {
    const projectId = socket.handshake.query.projectId;
    const meta = getProjectMeta(projectId);

    if (!meta) return;

    const interval = setInterval(() => {
      const used = getDiskUsage(projectId).toFixed(2);
      const max = meta.maxSpace || 2000;
      const speed = (Math.random() * 20 + 5).toFixed(1) + ' Mbps';

      socket.emit('stats', {
        used,
        free: (max - used).toFixed(2),
        speed
      });
    }, 5000);

    socket.on('disconnect', () => clearInterval(interval));
  });
};