const { getProjectMeta } = require('../../services/utils');
const { isRunning } = require('../../services/runner');

// === GET: Project Info
exports.showProjectInfo = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found' };
    return res.redirect('/');
  }

  meta.status = isRunning(id) ? 'online' : 'offline';

  res.render('project/layout', {
    project: meta,
    user: req.session.user,
    toast: req.session.toast,
    files: []
  });
};