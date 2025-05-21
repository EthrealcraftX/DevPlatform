const express = require('express');
const router = express.Router();
const createController = require('../controllers/createController');

function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}


// === GET: Create Project Page ===
router.get('/', createController.showCreatePage);

// === POST: Upload Files (drag/drop yoki file select orqali)
router.post('/upload', createController.uploadFiles);

// === POST: GitHub repo dan yuklab olish
router.post('/github', createController.installFromGithub);

// === DELETE: Uploadni bekor qilish
router.delete('/:id/cancel', createController.cancelUpload);

// === POST: Projectni yakunlash
router.post('/finish', createController.finishCreation);

module.exports = router;
