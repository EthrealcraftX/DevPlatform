const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const unzipper = require('unzipper');
const { saveProjectMeta, deleteFolderRecursive } = require('../services/utils');

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

  try {
    const zipUrl = url.endsWith('.git')
      ? url.replace('.git', '/archive/refs/heads/main.zip')
      : url + '/archive/refs/heads/main.zip';

    const id = crypto.randomUUID();
    const extractPath = path.join(__dirname, '..', 'uploads', id);
    fs.mkdirSync(extractPath, { recursive: true });

    const response = await fetch(zipUrl);
    if (!response.ok) throw new Error('Failed to fetch from GitHub');

    await new Promise((resolve, reject) => {
      response.body
        .pipe(unzipper.Extract({ path: extractPath }))
        .on('close', resolve)
        .on('error', reject);
    });

    // Flatten top folder
    const subdirs = fs.readdirSync(extractPath);
    let files = [];

    for (const dir of subdirs) {
      const full = path.join(extractPath, dir);
      if (fs.lstatSync(full).isDirectory()) {
        files = fs.readdirSync(full);
        for (const f of files) {
          fs.renameSync(path.join(full, f), path.join(extractPath, f));
        }
        fs.rmdirSync(full);
        break;
      }
    }

    const finalFiles = fs.readdirSync(extractPath);
    return res.json({ success: true, id, files: finalFiles });
  } catch (err) {
    console.error('[GitHub install]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

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
