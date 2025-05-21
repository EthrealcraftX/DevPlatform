const { getAllUsers, toggleAdmin } = require('../../services/userService');
const { getAllProjects } = require('../../services/utils');

exports.showUserList = (req, res) => {
  const users = getAllUsers();
  const projects = getAllProjects();

  const data = users.map(user => {
    const projectCount = projects.filter(p => p.ownerId === user.id).length;
    return { ...user, projectCount };
  });

  res.render('admin/users', { users: data, user: req.session.user });
};

exports.toggleAdminStatus = (req, res) => {
  const { id } = req.params;
  const success = toggleAdmin(id);

  req.session.toast = {
    type: success ? 'success' : 'error',
    message: success ? 'Role updated.' : 'User not found.'
  };

  res.redirect('/admin/users');
};
