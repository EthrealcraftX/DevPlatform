const path = require('path');
const fs = require('fs');
const { getProjectMeta } = require('../services/utils');

exports.openEditor = (req, res) => {
  const id = req.params.id;
  const filePath = req.query.path;
  const meta = getProjectMeta(id);

  if (!meta || !filePath) {
    req.session.toast = { type: 'error', message: 'Invalid request' };
    return res.redirect('/');
  }

  const fullPath = path.join(__dirname, '..', 'uploads', id, filePath);
  if (!fs.existsSync(fullPath)) {
    req.session.toast = { type: 'error', message: 'File not found' };
    return res.redirect(`/project/${id}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const modeMap = {
    '.js': 'javascript',
    '.py': 'python',
    '.html': 'htmlmixed',
    '.java': 'text/x-java'
  };

  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  res.render('editor', {
    fileContent,
    filePath,
    projectId: id,
    fileMode: modeMap[ext] || 'javascript',
    isReadOnly: meta.status === 'online'
  });
};
