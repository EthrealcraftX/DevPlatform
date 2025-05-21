const { getProjectMeta } = require('../../services/utils');
const { isRunning } = require('../../services/runner');
const fs = require('fs');
const path = require('path');

// === GET: Show Console Page
exports.showConsolePage = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found.' };
    return res.redirect('/');
  }

  const logPath = path.join(__dirname, '..', '..', 'logs', `${id}.log`);
  let logs = '';

  if (fs.existsSync(logPath)) {
    logs = fs.readFileSync(logPath, 'utf-8');
  }

  meta.status = isRunning(id) ? 'online' : 'offline';

  res.render('project/layout', {
    project: meta,
    user: req.session.user,
    logs,
    toast: req.session.toast,
    files: []
  });
};