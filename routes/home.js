const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/home', requireAuth, homeController.showHome);

module.exports = router;
