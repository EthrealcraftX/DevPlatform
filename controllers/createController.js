const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const unzipper = require('unzipper');
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

  try {
    const zipUrl = url.endsWith('.git')
      ? url.replace('.git', '/archive/refs/heads/main.zip')
      : url + '/archive/refs/heads/main.zip';

    const id = crypto.randomUUID();
    const extractDir = path.join(__dirname, '..', 'uploads', id);
    fs.mkdirSync(extractDir, { recursive: true });

    const response = await fetch(zipUrl);
    if (!response.ok) throw new Error('GitHub download failed');

    // ZIP faylni to‘liq ochguncha kutamiz
    await response.body
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // === Ichidagi top-level folderni flatten qilish ===
    const entries = fs.readdirSync(extractDir);
    for (const entry of entries) {
      const entryPath = path.join(extractDir, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        const innerFiles = fs.readdirSync(entryPath);
        for (const f of innerFiles) {
          const from = path.join(entryPath, f);
          const to = path.join(extractDir, f);
          try {
            fs.renameSync(from, to);
          } catch (e) {
            console.warn('[rename failed]', from, '=>', to, e.message);
          }
        }
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
    }

    // === Fayl daraxtini qaytaramiz
    const tree = readFileTree(extractDir);
    const flat = flattenFiles(tree);

    return res.json({ success: true, id, files: flat.map(f => f.path) });

  } catch (err) {
    console.error('[GitHub install]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
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

