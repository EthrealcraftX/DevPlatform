const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const users = require('../controllers/admin/userController');


// Middleware: faqat adminlar kira oladi
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  res.status(403).send('Forbidden');
}

// Dashboard
router.get('/', requireAdmin, adminController.dashboard);

// Approve / Reject users
router.post('/approve/:id', requireAdmin, adminController.approveUser);
router.post('/reject/:id', requireAdmin, adminController.rejectUser);

// Installation tools
router.get('/installation', requireAdmin, adminController.installationPage);
router.post('/install/python', requireAdmin, adminController.installPython);
router.post('/install/node', requireAdmin, adminController.installNode);
router.post('/check/python', requireAdmin, adminController.checkPython);
router.post('/check/node', requireAdmin, adminController.checkNode);
router.post('/check/java', requireAdmin, adminController.checkJava);

// Stats
router.get('/stats', requireAdmin, adminController.systemStatsPage);

//users
router.get('/users', requireAdmin, users.showUserList);
router.post('/users/:id/toggle', requireAdmin, users.toggleAdminStatus);


module.exports = router;