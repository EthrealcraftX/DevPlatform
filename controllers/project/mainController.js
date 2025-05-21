const path = require('path');
const fs = require('fs');
const { start, stop, isRunning } = require('../../services/runner');
const { getProjectMeta, saveProjectMeta, deleteFolderRecursive } = require('../../services/utils');
const { readFileTree } = require('../../services/fileTreeReader'); // ADD THIS

// === GET: Main project page
exports.showProjectMain = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found.' };
    return res.redirect('/');
  }

  meta.status = isRunning(id) ? 'online' : 'offline';

  // === READ LOG FILE ===
  const logPath = path.join(__dirname, '..', '..', 'logs', `${id}.log`);
  let logs = '';
  if (fs.existsSync(logPath)) {
    logs = fs.readFileSync(logPath, 'utf-8');
  }

  // === READ FILE TREE ===
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', id);
  let files = [];
  if (fs.existsSync(uploadDir)) {
    files = readFileTree(uploadDir);
  }

  res.render('project/layout', {
    project: meta,
    logs,
    toast: req.session.toast,
    user: req.session.user,
    files
  });
};

// === POST: Start project
exports.startProject = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found.' };
    return res.redirect('/');
  }

  const result = start(meta);

  if (result.status === 'started') {
    req.session.toast = { type: 'success', message: 'Project started.' };
  } else if (result.status === 'already_running') {
    req.session.toast = { type: 'info', message: 'Project already running.' };
  } else {
    req.session.toast = { type: 'error', message: 'Failed to start project.' };
  }

  res.redirect(`/project/${id}`);
};

// === POST: Stop project
exports.stopProject = (req, res) => {
  const id = req.params.id;
  const result = stop(id);

  if (result.status === 'stopped') {
    req.session.toast = { type: 'success', message: 'Project stopped.' };
  } else {
    req.session.toast = { type: 'info', message: 'Project was not running.' };
  }

  res.redirect(`/project/${id}`);
};

// === POST: Delete project
exports.deleteProject = (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    req.session.toast = { type: 'error', message: 'Project not found.' };
    return res.redirect('/');
  }

  if (isRunning(id)) {
    req.session.toast = { type: 'error', message: 'Stop project before deleting.' };
    return res.redirect(`/project/${id}`);
  }

  const dirPath = path.join(__dirname, '..', '..', 'uploads', id);
  if (fs.existsSync(dirPath)) {
    deleteFolderRecursive(dirPath);
  }

  const metaPath = path.join(__dirname, '..', '..', 'data', 'projects', `${id}.json`);
  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
  }

  req.session.toast = { type: 'success', message: 'Project deleted successfully.' };
  res.redirect('/');
};
