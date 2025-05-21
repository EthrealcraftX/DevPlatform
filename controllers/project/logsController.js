const path = require('path');
const fs = require('fs');
const { getProjectMeta } = require('../../services/utils');
const { isRunning } = require('../../services/runner');

// === GET: Show Logs Page
exports.showLogsPage = (req, res) => {
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
    toast: req.session.toast,
    logs,
    files: []
  });
};

// === GET: Download Logs File
exports.downloadLogFile = (req, res) => {
  const id = req.params.id;
  const logPath = path.join(__dirname, '..', '..', 'logs', `${id}.log`);

  if (!fs.existsSync(logPath)) {
    req.session.toast = { type: 'error', message: 'Log file not found.' };
    return res.redirect(`/project/${id}#logs`);
  }

  res.download(logPath, `${id}.log`, (err) => {
    if (err) {
      console.error('Download error:', err);
      req.session.toast = { type: 'error', message: 'Failed to download log file.' };
      res.redirect(`/project/${id}#logs`);
    }
  });
};