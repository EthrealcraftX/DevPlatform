const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '..', 'data', 'users.json');

function getAllUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
}

function toggleAdmin(userId) {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.isAdmin = !user.isAdmin;
    saveUsers(users);
    return true;
  }
  return false;
}

module.exports = {
  getAllUsers,
  saveUsers,
  toggleAdmin
};
