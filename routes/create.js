const express = require('express');
const router = express.Router();
const createController = require('../controllers/createController');

// Middleware: Auth tekshirish
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// === GET: Create page
router.get('/', requireAuth, createController.showCreatePage);

// === POST: Upload local files
router.post('/upload', requireAuth, createController.uploadFiles);

// === POST: Install from GitHub
router.post('/github', requireAuth, createController.installFromGithub);

// === DELETE: Cancel upload
router.delete('/:id/cancel', requireAuth, createController.cancelUpload);

// === POST: Finalize project
router.post('/finish', requireAuth, createController.finishCreation);

module.exports = router;
