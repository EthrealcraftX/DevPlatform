const { getAllProjects } = require('../services/utils');
const { isRunning } = require('../services/runner');

exports.showHome = (req, res) => {
  const user = req.session.user;

  let projects = getAllProjects().filter(p => p.ownerId === user.id);

  // Har bir project uchun status aniqlaymiz
  projects = projects.map(p => {
    p.status = isRunning(p.id) ? 'online' : 'offline';
    return p;
  });

  res.render('home', { user, projects });
};
