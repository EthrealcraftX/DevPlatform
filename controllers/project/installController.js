const path = require('path');
const { spawn } = require('child_process');
const { getProjectMeta } = require('../../services/utils');

exports.installDependencies = (req, res) => {
  const id = req.params.id;
  const { packageName } = req.body;
  const meta = getProjectMeta(id);

  if (!meta || !packageName) {
    req.session.toast = { type: 'error', message: 'Invalid request' };
    return res.redirect(`/project/${id}#install`);
  }

  const cwd = path.join(__dirname, '..', '..', 'uploads', id);
  const cmd = meta.type === 'python' ? 'pip' : meta.type === 'nodejs' ? 'npm' : null;

  if (!cmd) {
    req.session.toast = { type: 'error', message: 'Unsupported project type for install.' };
    return res.redirect(`/project/${id}#install`);
  }

  const args = ['install', ...packageName.split(' ')];

  const installer = spawn(cmd, args, { cwd, shell: true });

  installer.on('close', code => {
    req.session.toast = {
      type: code === 0 ? 'success' : 'error',
      message: code === 0 ? 'Packages installed successfully.' : 'Installation failed!'
    };
    return res.redirect(`/project/${id}#install`);
  });
};
