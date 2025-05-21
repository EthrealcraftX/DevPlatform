const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const unzipper = require('unzipper');
const fetch = require('node-fetch');
const { saveProjectMeta, deleteFolderRecursive } = require('../services/utils');

// === GET: Create Project Page ===
exports.showCreatePage = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('create');
};

// === POST: Upload Files (local upload)
exports.uploadFiles = (req, res) => {
  const user = req.session.user;

  if (!req.files || !req.files.files) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const id = crypto.randomUUID();
  const uploadPath = path.join(__dirname, '..', 'uploads', id);
  fs.mkdirSync(uploadPath, { recursive: true });

  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  const uploadedNames = [];

  for (const file of files) {
    const dest = path.join(uploadPath, file.name);
    uploadedNames.push(file.name);
    file.mv(dest, err => {
      if (err) console.error('Upload error:', err);
    });
  }

  return res.json({ success: true, id, files: uploadedNames });
};

// === POST: Upload from GitHub
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
    if (!response.ok) throw new Error('GitHub download failed');

    await new Promise((resolve, reject) => {
      response.body
        .pipe(unzipper.Extract({ path: extractPath }))
        .on('close', resolve)
        .on('error', reject);
    });

    // Flatten top-level directory (if any)
    const entries = fs.readdirSync(extractPath);
    let extractedFiles = [];

    for (const entry of entries) {
      const fullPath = path.join(extractPath, entry);
      if (fs.lstatSync(fullPath).isDirectory()) {
        const subFiles = fs.readdirSync(fullPath);
        for (const file of subFiles) {
          fs.renameSync(path.join(fullPath, file), path.join(extractPath, file));
        }
        fs.rmdirSync(fullPath);
        extractedFiles = subFiles;
        break;
      }
    }

    return res.json({ success: true, id, files: extractedFiles });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// === DELETE: Cancel Upload (remove folder)
exports.cancelUpload = (req, res) => {
  const { id } = req.params;
  const folder = path.join(__dirname, '..', 'uploads', id);
  const metaFile = path.join(__dirname, '..', 'data', 'projects', `${id}.json`);

  if (fs.existsSync(folder)) {
    deleteFolderRecursive(folder);
  }
  if (fs.existsSync(metaFile)) {
    fs.unlinkSync(metaFile);
  }

  return res.json({ success: true, message: 'Upload canceled' });
};

// === POST: Final project creation
exports.finishCreation = (req, res) => {
  const { id, name, main, type } = req.body;
  const folder = path.join(__dirname, '..', 'uploads', id);

  if (!fs.existsSync(folder)) {
    return res.status(404).json({ success: false, message: 'Upload folder not found' });
  }

  if (!name || !main || !type) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const meta = {
    id,
    name,
    main,
    type,
    createdAt: new Date().toISOString(),
    ownerId: req.session.user.id,
    status: 'offline',
    maxSpace: 2000
  };

  saveProjectMeta(meta); // ✅ TO‘G‘RI chaqiruv
  return res.json({ success: true });
};
