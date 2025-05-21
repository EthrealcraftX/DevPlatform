const express = require('express');
const router = express.Router();

// Sub-routes
const authRoutes = require('./auth');
const createRoutes = require('./create');
const projectRoutes = require('./project');
const adminRoutes = require('./admin');
const homeRouter = require('./home');


const { getAllProjects } = require('../services/utils');

// === Auth (login, register, logout)
router.use('/', authRoutes);

// === Project creation
router.use('/create', createRoutes);

// === Individual project view / control
router.use('/project', projectRoutes);

// === Admin panel
router.use('/admin', adminRoutes);

router.use('/', homeRouter);

// === Home page
router.get('/home', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const allProjects = getAllProjects();
  const user = req.session.user;

  // Faqat adminlar hamma projectni ko‘radi
  const projects = user.isAdmin
    ? allProjects
    : allProjects.filter(p => p.ownerId === user.id);

  res.render('home', {
    user,
    projects
  });
});

// === Root redirect
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/home');
});

// === 404 fallback (optional)
router.use((req, res) => {
  res.status(404).send('404 Not Found');
});

module.exports = router;
