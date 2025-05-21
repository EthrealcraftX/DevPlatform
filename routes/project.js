const express = require('express');
const router = express.Router();

const main = require('../controllers/project/mainController');
const settings = require('../controllers/project/settingsController');
const consoleCtl = require('../controllers/project/consoleController');
const logs = require('../controllers/project/logsController');
const files = require('../controllers/fileController');
const stats = require('../controllers/project/statsController');
const editorController = require('../controllers/editorController');
const install = require('../controllers/project/installController');




// Middleware
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// === Project Overview (Main)
router.get('/:id', requireAuth, main.showProjectMain);
router.post('/:id/start', requireAuth, main.startProject);
router.post('/:id/stop', requireAuth, main.stopProject);
router.post('/:id/delete', requireAuth, main.deleteProject);

// === Settings
/* router.get('/:id/settings', requireAuth, settings.showSettings);
router.post('/:id/settings/main', requireAuth, settings.updateMainFile);
router.post('/:id/settings/type', requireAuth, settings.updateType);
router.post('/:id/settings/space', requireAuth, settings.updateMaxSpace); */
router.get('/:id/settings', requireAuth, settings.showSettings);
router.post('/:id/settings', requireAuth, settings.saveSettings);


// === Console
router.get('/:id/console', requireAuth, consoleCtl.showConsolePage);

// === Logs
router.get('/:id/logs', requireAuth, logs.showLogsPage);
router.get('/:id/logs/download', requireAuth, logs.downloadLogFile);

// === Files
router.get('/:id/files', requireAuth, files.listFiles);
router.post('/:id/files/upload', requireAuth, files.uploadFile);
router.post('/:id/files/delete', requireAuth, files.deleteFile);
router.post('/:id/files/rename', requireAuth, files.renameFile);
router.get('/:id/files/read', requireAuth, files.readFile);
router.post('/:id/files/save', requireAuth, files.saveFile);
router.post('/:id/file/open', requireAuth, files.openEditor);
router.get('/:id/files/editor', requireAuth, files.renderEditor);
router.get('/:id/editor', requireAuth, editorController.openEditor); // <-- yangi route


// === Stats
router.get('/:id/stats', requireAuth, stats.showStatsPage);

// install
router.post('/:id/install', requireAuth, install.installDependencies);


module.exports = router;