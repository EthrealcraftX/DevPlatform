const { getProjectMeta } = require('../../services/utils');
const { getDiskUsage } = require('../../services/statsService');

// === GET: Show Project Stats Page
exports.showStatsPage = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found' };
    return res.redirect('/');
  }

  // Initial data for rendering
  const used = getDiskUsage(id).toFixed(2);
  const max = meta.maxSpace || 2000;
  const free = (max - used).toFixed(2);
  const percentUsed = ((used / max) * 100).toFixed(1);

  res.render('project/layout', {
    project: meta,
    user: req.session.user,
    toast: req.session.toast,
    stats: { used, free, max, percentUsed },
    files: []
  });
};