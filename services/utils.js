const fs = require('fs');
const path = require('path');

const metaDir = path.join(__dirname, '..', 'data', 'projects');

// === Berilgan project ID uchun metadata yo‘lini olish
function getMetaPath(id) {
  return path.join(metaDir, `${id}.json`);
}

// === Project metadata’sini o‘qish
function getProjectMeta(id) {
  const metaPath = getMetaPath(id);
  if (!fs.existsSync(metaPath)) return null;

  try {
    const data = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[utils] Error reading metadata for project ${id}:`, err);
    return null;
  }
}

// === Project metadata’sini saqlash (yaratish yoki yangilash)
function saveProjectMeta(meta) {
  if (!meta || !meta.id) {
    throw new Error('[utils] Invalid project metadata');
  }

  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }

  const metaPath = getMetaPath(meta.id);

  try {
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[utils] Failed to save metadata for project ${meta.id}:`, err);
  }
}

// === Barcha project metadata fayllarini olish
function getAllProjects() {
  if (!fs.existsSync(metaDir)) return [];

  return fs.readdirSync(metaDir)
    .filter(name => name.endsWith('.json'))
    .map(name => {
      const file = path.join(metaDir, name);
      try {
        const data = fs.readFileSync(file, 'utf-8');
        return JSON.parse(data);
      } catch (err) {
        console.error(`[utils] Error reading metadata file ${file}:`, err);
        return null;
      }
    })
    .filter(Boolean); // nulllarni olib tashlash
}

// === Papkani rekursiv o‘chirish
function deleteFolderRecursive(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`[utils] Failed to delete folder ${dirPath}:`, err);
  }
}

module.exports = {
  getMetaPath,
  getProjectMeta,
  saveProjectMeta,
  getAllProjects,
  deleteFolderRecursive
};
