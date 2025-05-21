const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { generateRandomId, copyFolderSync } = require('../utils/generateId');
const manager = require('../utils/projectProcessManager');

// Bosh sahifa — loyihalar
router.get('/', (req, res) => {
    const projectsPath = path.join(__dirname, '..', 'projects');
    if (!fs.existsSync(projectsPath)) fs.mkdirSync(projectsPath);

    const projectDirs = fs.readdirSync(projectsPath).filter(dir =>
        fs.statSync(path.join(projectsPath, dir)).isDirectory()
    );

    const projects = projectDirs.map(id => {
        const configPath = path.join(projectsPath, id, 'config.json');

        let project = {
            id,
            name: `Project-${id}`,
            host: '-',
            port: '-',
            version: '-',
            status: manager.getStatus(id)
        };

        if (fs.existsSync(configPath)) {
            try {
                const raw = fs.readFileSync(configPath);
                const parsed = JSON.parse(raw);

                project.name = parsed.name || `Project-${id}`;
                project.host = parsed.host || parsed.ip || '-';
                project.port = parsed.port || '-';
                project.version = parsed.version || '-';
            } catch (err) {
                console.error(`config.json o'qishda xato: ${err.message}`);
            }
        }

        return project;
    });

    res.render('index', { projects });
});

// CREATE sahifa
router.get('/create', (req, res) => {
    res.render('create');
});

// CREATE — yangi project yaratish
router.post('/create', (req, res) => {
    const { ip, port, version, template } = req.body;
    const id = generateRandomId();

    const newProjectPath = path.join(__dirname, '..', 'projects', id);
    const templatePath = path.join(__dirname, '..', 'templates', template);

    if (!fs.existsSync(templatePath)) {
        return res.status(500).send(`Template topilmadi: ${template}`);
    }

    fs.mkdirSync(newProjectPath, { recursive: true });

    // Butun papkani nusxalaymiz
    copyFolderSync(templatePath, newProjectPath);

    // config.json faylini yaratamiz (template asosida emas)
    const config = {
        host: ip || "ADRESS",
        port: /^\d{4,5}$/.test(port) ? parseInt(port) : "PORT",
        version: version || "VERSIYA"
    };

    if (template === 'java') {
        config.movementInterval = 5000;
        config.reconnectHours = 2;
        config.usernameFile = "usernames.txt";
        config.actions = [
            "jump",
            "moveForward",
            "moveBackward",
            "strafeLeft",
            "strafeRight",
            "lookAround",
            "attackMobs"
        ];
    }

    const configPath = path.join(newProjectPath, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    res.redirect('/');
});

// RUN
router.post('/run/:id', (req, res) => {
    const id = req.params.id;
    try {
        manager.runProject(id);
    } catch (err) {
        console.error(`RUN xato: ${err.message}`);
    }
    res.redirect('/');
});

// STOP
router.post('/stop/:id', (req, res) => {
    const id = req.params.id;
    try {
        manager.stopProject(id);
    } catch (err) {
        console.error(`STOP xato: ${err.message}`);
    }
    res.redirect('/');
});

// DELETE
router.post('/delete/:id', (req, res) => {
    const id = req.params.id;

    manager.stopProject(id); // xavfsizlik uchun
    const folderPath = path.join(__dirname, '..', 'projects', id);
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
    }

    res.redirect('/');
});

// LOG KO‘RISH
router.get('/logs/:id', (req, res) => {
    const id = req.params.id;
    const logPath = path.join(__dirname, '..', 'projects', id, 'log.txt');
  
    if (!fs.existsSync(logPath)) {
      return res.send('📭 Log fayl mavjud emas yoki project hali run bo‘lmagan.');
    }
  
    const content = fs.readFileSync(logPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  });
  

module.exports = router;