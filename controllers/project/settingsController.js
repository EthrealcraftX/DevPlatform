const path = require('path');
const { getProjectMeta, saveProjectMeta } = require('../../services/utils');
const { readFileTree } = require('../../services/fileTreeReader');

// === GET: Show Settings Page
exports.showSettings = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found.' };
    return res.redirect('/');
  }

  const uploadPath = path.join(__dirname, '..', '..', 'uploads', id);
  const fileTree = readFileTree(uploadPath);

  const flatFiles = [];
  const flatten = (tree) => {
    for (const item of tree) {
      if (item.type === 'file') flatFiles.push(item);
      else if (item.type === 'folder') flatten(item.children);
    }
  };
  flatten(fileTree);

  res.render('project/layout', {
    project: meta,
    files: flatFiles,
    toast: req.session.toast,
    user: req.session.user
  });
};

// === POST: Save All Settings (mainFile, type, maxSpace)
exports.saveSettings = (req, res) => {
  const id = req.params.id;
  const { mainFile, type, maxSpace } = req.body;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found.' };
    return res.redirect('/');
  }

  if (mainFile) meta.main = mainFile;
  if (['nodejs', 'python', 'java'].includes(type)) {
    meta.type = type;
  }

  const parsedSpace = parseInt(maxSpace);
  if (!isNaN(parsedSpace) && parsedSpace >= 100) {
    meta.maxSpace = parsedSpace;
  }

  saveProjectMeta(meta);

  req.session.toast = { type: 'success', message: 'Settings updated successfully.' };
  res.redirect(`/project/${id}#settings`);
};
