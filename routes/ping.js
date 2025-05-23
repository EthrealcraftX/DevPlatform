const express = require('express');
const router = express.Router();
const { getProjectMeta } = require('../services/utils');

router.get('/:id/ping', (req, res) => {
  const id = req.params.id;
  const meta = getProjectMeta(id);

  if (!meta) {
    return res.status(404).send('❌ Project not found.');
  }

  res.send(`✅ Project "${meta.name}" [${id}] is running!`);
});

module.exports = router;
