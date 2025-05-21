const path = require('path');
const fs = require('fs');
const { getProjectMeta } = require('../services/utils');

const uploadsDir = path.join(__dirname, '..', 'uploads');

// === GET: list files
exports.listFiles = (req, res) => {
  const id = req.params.id;
  const dir = path.join(uploadsDir, id, req.query.path || '');

  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list files.' });

    const data = files.map(f => ({
      name: f.name,
      isDir: f.isDirectory()
    }));

    res.json({ files: data });
  });
};

// === POST: upload file into folder
exports.uploadFile = (req, res) => {
  const id = req.params.id;
  const relativePath = req.body.path || '';
  const file = req.files?.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const destPath = path.join(uploadsDir, id, relativePath, file.name);
  file.mv(destPath, err => {
    if (err) return res.status(500).json({ error: 'Upload failed' });
    res.json({ success: true });
  });
};

// === DELETE: delete file
exports.deleteFile = (req, res) => {
  const id = req.params.id;
  const { filePath } = req.body;
  const meta = getProjectMeta(id);

  if (meta.main === filePath) {
    return res.status(400).json({ error: 'Cannot delete main file' });
  }

  const fullPath = path.join(uploadsDir, id, filePath);
  fs.rm(fullPath, { recursive: true, force: true }, (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true });
  });
};

// === POST: rename file
exports.renameFile = (req, res) => {
  const id = req.params.id;
  const { oldPath, newName } = req.body;

  const oldFullPath = path.join(uploadsDir, id, oldPath);
  const newFullPath = path.join(path.dirname(oldFullPath), newName);

  fs.rename(oldFullPath, newFullPath, err => {
    if (err) return res.status(500).json({ error: 'Rename failed' });
    res.json({ success: true });
  });
};

// === GET: read file content
exports.readFile = (req, res) => {
  const id = req.params.id;
  const filePath = req.query.path;

  if (!filePath) return res.status(400).json({ error: 'Missing file path' });

  const fullPath = path.join(uploadsDir, id, filePath);
  fs.readFile(fullPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read failed' });
    res.json({ content: data });
  });
};

// === POST: save file content
exports.saveFile = (req, res) => {
  const id = req.params.id;
  const { filePath, content } = req.body;

  const fullPath = path.join(uploadsDir, id, filePath);
  fs.writeFile(fullPath, content, 'utf-8', err => {
    if (err) return res.status(500).json({ error: 'Save failed' });
    res.json({ success: true });
  });
};


// === GET: Render editor page
exports.renderEditor = (req, res) => {
  const id = req.params.id;
  const filePath = req.query.path;
  const fullPath = path.join(__dirname, '..', 'uploads', id, filePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File not found');
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  res.render('editor', {
    filename: path.basename(filePath),
    filepath: filePath,
    content,
    projectId: id
  });
};


// === GET: Open file editor (render editor.ejs)
exports.openEditor = (req, res) => {
  const id = req.params.id;
  const filePath = req.body.path;
  const meta = getProjectMeta(id);

  if (!filePath || !meta) {
    req.session.toast = { type: 'error', message: 'Invalid file or project.' };
    return res.redirect(`/project/${id}#files`);
  }

  const absPath = path.join(__dirname, '..', 'uploads', id, filePath);
  if (!fs.existsSync(absPath)) {
    req.session.toast = { type: 'error', message: 'File does not exist.' };
    return res.redirect(`/project/${id}#files`);
  }

  const fileContent = fs.readFileSync(absPath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  let fileMode = 'javascript';
  if (ext === '.py') fileMode = 'python';
  else if (ext === '.html') fileMode = 'htmlmixed';
  else if (ext === '.java') fileMode = 'text/x-java';
  else if (ext === '.json') fileMode = 'application/json';

  const isReadOnly = meta.status === 'online';

  res.render('project/tabs/editor', {
    projectId: id,
    filePath,
    fileContent,
    fileMode,
    isReadOnly
  });
};
