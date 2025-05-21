const { createClient } = require('bedrock-protocol');
const chalk = require('chalk');
const config = require('./config.json');
const fs = require('fs');

let bot;
let autoRestartTimer = null;

// --- USERNAME FILEDAN RANDOM TANLASH ---
function pickRandomUsernameFromFile() {
  try {
    const data = fs.readFileSync('username.txt', 'utf8');
    const names = data.split('\n').map(n => n.trim()).filter(Boolean);
    const index = Math.floor(Math.random() * names.length);
    return names[index];
  } catch (err) {
    console.error(chalk.red('username.txt fayl o‘qib bo‘lmadi:'), err.message);
    return 'DefaultBot';
  }
}

// --- BOT YARATISH ---
function createBot() {
  const username = pickRandomUsernameFromFile();
  console.log(chalk.cyan(`🆕 Bot yaratildi: ${username}`));

  bot = createClient({
    host: config.host,
    port: config.port,
    username: username,
    offline: true,
    version: config.version
  });

  bot.on('join', () => {
    console.log(chalk.green(`✅ '${username}' serverga qo‘shildi.`));

    autoRestartTimer = setTimeout(() => {
      console.log(chalk.magenta('⏳ 2 soat o‘tdi — bot qayta ulanadi.'));
      bot.disconnect();
    }, 2 * 60 * 60 * 1000);
  });

  bot.on('disconnect', (reason) => {
    console.log(chalk.red('❌ Bot uzildi. Sabab:'), reason);
    if (autoRestartTimer) clearTimeout(autoRestartTimer);
    reconnect();
  });

  bot.on('error', (err) => {
    console.log(chalk.red('⚠️ Xatolik:'), err.message);
  });

  setInterval(() => {
    if (!bot.player || !bot.player.position) return;

    const pos = bot.player.position;
    const dx = (Math.random() - 0.5) * 2;
    const dz = (Math.random() - 0.5) * 2;

    bot.write('move_player', {
      position: {
        x: pos.x + dx,
        y: pos.y,
        z: pos.z + dz
      },
      mode: 0,
      on_ground: true,
      ridden_entity_runtime_id: 0,
      teleport_cause: 0,
      entity_type: 0
    });

    console.log(chalk.blue(`🚶 Yurdi: (${(pos.x + dx).toFixed(2)}, ${(pos.z + dz).toFixed(2)})`));
  }, 3000);
}

function reconnect() {
  console.log(chalk.yellow('🔁 5 soniyadan keyin qayta ulanmoqda...'));
  setTimeout(() => {
    createBot();
  }, 5000);
}

// Start
createBot();