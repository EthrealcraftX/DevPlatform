const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { generateRandomId, copyFolderSync } = require('../utils/generateId');
const { runProject, stopProject, getStatus } = require('../utils/projectProcessManager');

const router = express.Router();

// Token joyi
const configDir = path.join(__dirname, '..', 'config');
const configPath = path.join(configDir, 'api.config.json');
let apiToken = null;

// ✅ API tokenni avtomatik yaratamiz agar mavjud bo'lmasa
if (!fs.existsSync(configPath)) {
    const randomToken = crypto.randomBytes(24).toString('hex');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ apiToken: randomToken }, null, 4));
    console.log(`✅ Yangi API token yaratildi: ${randomToken}`);
    apiToken = randomToken;
} else {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    apiToken = config.apiToken;
}

// === API HANDLER ===
router.post('/telegram-action', (req, res) => {
    const { command, payload, token } = req.body;

    // 🔐 Tokenni tekshiramiz
    if (!token || token !== apiToken) {
        return res.status(401).json({ success: false, message: 'Invalid or missing API token' });
    }

    try {
        switch (command) {
            case 'status': {
                const { id } = payload;
                const status = getStatus(id);
                return res.json({ success: true, status });
            }

            case 'run': {
                const { id } = payload;
                runProject(id);
                return res.json({ success: true, message: `Project ${id} ishga tushdi.` });
            }

            case 'stop': {
                const { id } = payload;
                stopProject(id);
                return res.json({ success: true, message: `Project ${id} to‘xtatildi.` });
            }

            case 'delete': {
                const { id } = payload;
                stopProject(id);

                const projectPath = path.join(__dirname, '..', 'projects', id);
                const logPath = path.join(__dirname, '..', 'logs', `${id}.log`);

                if (fs.existsSync(projectPath)) {
                    fs.rmSync(projectPath, { recursive: true, force: true });
                }

                if (fs.existsSync(logPath)) {
                    fs.unlinkSync(logPath);
                }

                return res.json({ success: true, message: `Project ${id} o‘chirildi.` });
            }

            case 'create': {
                const { ip, port, version, template } = payload;
                const id = generateRandomId();

                const newProjectPath = path.join(__dirname, '..', 'projects', id);
                const templatePath = path.join(__dirname, '..', 'templates', template);

                if (!fs.existsSync(templatePath)) {
                    return res.status(400).json({ success: false, message: 'Template not found' });
                }

                fs.mkdirSync(newProjectPath, { recursive: true });
                copyFolderSync(templatePath, newProjectPath);

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

                return res.json({ success: true, message: 'Project created', id });
            }

            default:
                return res.status(400).json({ success: false, message: 'Unknown command' });
        }

    } catch (err) {
        console.error('API ERROR:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;