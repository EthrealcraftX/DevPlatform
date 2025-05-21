const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// === GET: Login page
router.get('/login', authController.showLogin);

// === POST: Login
router.post('/login', authController.login);

// === GET: Register page
router.get('/register', authController.showRegister);

// === POST: Register
router.post('/register', authController.register);

// === GET: Logout
router.get('/logout', authController.logout);

module.exports = router;