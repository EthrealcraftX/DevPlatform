const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const usersPath = path.join(__dirname, '..', 'data', 'users.json');
const { getAllProjects } = require('../services/utils');
const { getDiskUsage } = require('../services/statsService');
const { sendMail } = require('../services/emailService');

// === Helper functions ===
function loadUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// === GET: Admin Dashboard
exports.dashboard = (req, res) => {
  const users = loadUsers();
  const pendingUsers = users.filter(u => u.status === 'pending');
  res.render('admin/dashboard', {
    user: req.session.user,
    pendingUsers
  });
};

// === POST: Approve user
exports.approveUser = (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.id === req.params.id);

  if (user) {
    user.status = 'approved';
    saveUsers(users);

    // Send email notification
    sendMail(user.email, 'Access Granted', `
      Hello ${user.username}, your account has been approved!
      You can now login: http://localhost:3000/login
    `);
  }

  res.redirect('/admin');
};

// === POST: Reject user
exports.rejectUser = (req, res) => {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === req.params.id);

  if (index !== -1) {
    users.splice(index, 1);
    saveUsers(users);
  }

  res.redirect('/admin');
};

// === GET: Installation page
exports.installationPage = (req, res) => {
  res.render('admin/installation');
};

// === GET: Stats page
exports.systemStatsPage = (req, res) => {
  const projects = getAllProjects();

  const stats = {
    cpu: (Math.random() * 50 + 10).toFixed(1),
    ram: (Math.random() * 60 + 20).toFixed(1),
    internet: (Math.random() * 20 + 10).toFixed(1),
    totalProjects: projects.length,
    usedSpace: projects.reduce((sum, p) => sum + getDiskUsage(p.id), 0).toFixed(1),
    projectNames: projects.map(p => p.name),
    projectSizes: projects.map(p => getDiskUsage(p.id).toFixed(1))
  };

  res.render('admin/stats', { stats });
};

// === POST: Python install
exports.installPython = (req, res) => {
  exec('pip install -r requirements.txt', (err, stdout, stderr) => {
    console.log(stdout || stderr);
    res.redirect('/admin/installation');
  });
};

// === POST: Node install
exports.installNode = (req, res) => {
  exec('npm install', (err, stdout, stderr) => {
    console.log(stdout || stderr);
    res.redirect('/admin/installation');
  });
};

// === POST: Check Python version
exports.checkPython = (req, res) => {
  exec('python --version', (err, stdout, stderr) => {
    console.log(stdout || stderr);
    res.redirect('/admin/installation');
  });
};

// === POST: Check Node version
exports.checkNode = (req, res) => {
  exec('node -v', (err, stdout, stderr) => {
    console.log(stdout || stderr);
    res.redirect('/admin/installation');
  });
};

// === POST: Check Java version
exports.checkJava = (req, res) => {
  exec('java -version', (err, stdout, stderr) => {
    console.log(stdout || stderr);
    res.redirect('/admin/installation');
  });
};