const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const unzipper = require('unzipper');
const { exec } = require('child_process');
const { saveProjectMeta, deleteFolderRecursive } = require('../services/utils');
const { readFileTree } = require('../services/fileTreeReader');

// === GET: Show Create Page
exports.showCreatePage = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('create', { user: req.session.user });
};

// === POST: Upload Files (folder/fayl support)
exports.uploadFiles = (req, res) => {
  if (!req.files || !req.files.files) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const id = crypto.randomUUID();
  const uploadDir = path.join(__dirname, '..', 'uploads', id);
  fs.mkdirSync(uploadDir, { recursive: true });

  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  const uploadedNames = [];

  for (const file of files) {
    const relPath = file.name; // includes folder structure (webkitRelativePath)
    const fullPath = path.join(uploadDir, relPath);
    const folder = path.dirname(fullPath);

    fs.mkdirSync(folder, { recursive: true });
    uploadedNames.push(relPath);

    file.mv(fullPath, err => {
      if (err) console.error('Upload error:', err);
    });
  }

  return res.json({ success: true, id, files: uploadedNames });
};

// === POST: Install from GitHub repo
exports.installFromGithub = async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('github.com')) {
    return res.status(400).json({ success: false, message: 'Invalid GitHub URL' });
  }

  const id = crypto.randomUUID();
  const basePath = path.join(__dirname, '..', 'uploads', id);
  const clonePath = path.join(basePath, 'temp');

  fs.mkdirSync(clonePath, { recursive: true });

  const cloneCmd = `git clone ${url} "${path.join(clonePath, 'server-panel')}"`;

  exec(cloneCmd, async (err, stdout, stderr) => {
    if (err) {
      console.error('[git clone error]', stderr);
      return res.status(500).json({ success: false, message: 'Git clone failed' });
    }

    try {
      const source = path.join(clonePath, 'server-panel');
      const files = fs.readdirSync(source);

      // Move files to basePath
      for (const file of files) {
        const src = path.join(source, file);
        const dest = path.join(basePath, file);
        fs.renameSync(src, dest);
      }

      // Cleanup
      fs.rmSync(clonePath, { recursive: true, force: true });

      const resultFiles = fs.readdirSync(basePath);
      return res.json({ success: true, id, files: resultFiles });
    } catch (moveErr) {
      console.error('[move error]', moveErr);
      return res.status(500).json({ success: false, message: 'Move failed' });
    }
  });
};

// === Helper to flatten file tree
function flattenFiles(tree) {
  let result = [];
  for (const item of tree) {
    if (item.type === 'file') {
      result.push(item);
    } else if (item.type === 'folder') {
      result = result.concat(flattenFiles(item.children));
    }
  }
  return result;
}
// === POST: Finalize project creation
exports.finishCreation = (req, res) => {
  const { id, name, main, type, maxSpace } = req.body;

  if (!id || !name || !main || !type) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const uploadPath = path.join(__dirname, '..', 'uploads', id);
  if (!fs.existsSync(uploadPath)) {
    return res.status(404).json({ success: false, message: 'Upload folder not found' });
  }

  const meta = {
    id,
    name,
    main,
    type,
    maxSpace: Number(maxSpace),
    createdAt: new Date().toISOString(),
    ownerId: req.session.user?.id || 'unknown',
    status: 'offline'
  };

  saveProjectMeta(meta);
  return res.json({ success: true });
};

// === DELETE: Cancel Upload
exports.cancelUpload = (req, res) => {
  const { id } = req.params;
  const uploadPath = path.join(__dirname, '..', 'uploads', id);
  const metaPath = path.join(__dirname, '..', 'data', 'projects', `${id}.json`);

  if (fs.existsSync(uploadPath)) {
    deleteFolderRecursive(uploadPath);
  }
  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
  }

  return res.json({ success: true, message: 'Upload canceled' });
};
  
