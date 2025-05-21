const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sendMail } = require('../services/emailService');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');

// === Helper ===
function loadUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// === GET: Login sahifa
exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

// === POST: Login
exports.login = (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.render('login', { error: 'Invalid username or password' });
  }

  if (user.status === 'pending') {
    return res.render('login', { error: 'Your account is awaiting admin approval.' });
  }

  req.session.user = user;
  res.redirect('/');
};

exports.showCreatePage = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('create');
};

// === GET: Register sahifa
exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

// === POST: Register
exports.register = (req, res) => {
  const { username, password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }

  const users = loadUsers();

  if (users.find(u => u.username === username)) {
    return res.render('register', { error: 'Username already taken.' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    password,
    email,
    status: 'pending',
    isAdmin: false
  };

  users.push(newUser);
  saveUsers(users);

  // Userga email: kuting
  sendMail(email, 'Pending Approval', `
    Hello ${username},<br><br>
    Your account is registered and pending admin approval.<br>
    We will notify you once access is granted.<br><br>
    — MultiMax Server
  `);

  // Adminga email: yangi user kutmoqda (realda: admin emailini o'zgartiring)
  sendMail('admin@HypePath.us', 'New user awaiting approval', `
    New user registered: <b>${username}</b><br>
    Email: ${email}<br><br>
    Approve here: http://localhost:3000/admin
  `);

  res.render('login', { error: 'Account registered. Awaiting admin approval.' });
};

// === GET: Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};