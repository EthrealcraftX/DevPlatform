const mineflayer = require('mineflayer');
const path = require('path');
const fs = require('fs');

// Config faylni o'qish
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Usernamelarni fayldan o'qish
const usernames = fs.readFileSync(path.join(__dirname, config.usernameFile), 'utf8')
  .split('\n')
  .map(name => name.trim())
  .filter(name => name.length > 0);

// Foydalanilgan usernamelarni saqlash
const usedUsernames = new Set();

// Tasodifiy username generator
function getRandomUsername() {
  // Agar barcha usernamelar ishlatilgan bo'lsa, ro'yxatni tozalash
  if (usedUsernames.size >= usernames.length) {
    console.log('Barcha usernamelar ishlatildi, ro\'yxat qayta tiklanmoqda...');
    usedUsernames.clear();
  }

  // Ishlatilmagan username topish
  const availableUsernames = usernames.filter(name => !usedUsernames.has(name));
  const randomUsername = availableUsernames[Math.floor(Math.random() * availableUsernames.length)];
  
  // Tanlangan username ni ishlatilganlar ro'yxatiga qo'shish
  usedUsernames.add(randomUsername);
  return randomUsername;
}

// Botni ishga tushirish funksiyasi
function startBot() {
  const username = getRandomUsername();
  console.log(`Yangi username bilan kirish: ${username}`);
  
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: username,
    version: config.version,
  });

  // Timeout va reconnect sozlamalari
  let reconnectInterval;
  const RECONNECT_DELAY = 30000;
  const RECONNECT_HOURS = config.reconnectHours || 2;
  const RECONNECT_MS = RECONNECT_HOURS * 60 * 60 * 1000;

  // Har 2 soatda qayta ulanish
  let scheduledReconnect;

  // Bot eventlari
  bot.on('login', () => {
    console.log(`Bot ${bot.username} serverga ulandi!`);
    clearTimeout(reconnectInterval);
    
    // Yangi 2 soatlik reconnect
    clearTimeout(scheduledReconnect);
    scheduledReconnect = setTimeout(() => {
      console.log('2 soat tugadi, yangi username bilan qayta ulanish...');
      bot.end();
    }, RECONNECT_MS);
  });

  bot.on('spawn', () => {
    console.log('Bot spawn bo\'ldi! AFK rejimi ishga tushdi.');
    startRandomActions(bot);
  });

  bot.on('kicked', (reason) => {
    console.log('Bot serverdan chiqarib yuborildi:', reason);
    tryReconnect();
  });

  bot.on('error', (err) => {
    console.log('Xatolik yuz berdi:', err);
    tryReconnect();
  });

  bot.on('end', () => {
    console.log('Server bilan aloqa uzildi.');
    tryReconnect();
  });

  // Qayta ulanish funktsiyasi
  function tryReconnect() {
    console.log(`${RECONNECT_DELAY/1000} soniyadan keyin yangi username bilan ulaniladi...`);
    clearTimeout(reconnectInterval);
    reconnectInterval = setTimeout(() => {
      console.log('Yangi username bilan qayta ulanishga urinilmoqda...');
      startBot(); // Yangi botni ishga tushirish
    }, RECONNECT_DELAY);
  }

  return bot;
}

// Moblarga hujum qilish funktsiyasi
function attackNearbyMobs(bot) {
  const entityTypes = ['zombie', 'skeleton', 'spider', 'creeper'];
  const targetEntity = bot.nearestEntity(entity => {
    return entityTypes.includes(entity.name) && 
           entity.position.distanceTo(bot.entity.position) < 3;
  });

  if (targetEntity) {
    bot.attack(targetEntity);
    console.log(`${targetEntity.name} ga hujum qilindi!`);
  } else {
    console.log('Yaquin atrofda mob topilmadi');
  }
}

// Tasodifiy harakatlar funktsiyasi
function startRandomActions(bot) {
  const interval = setInterval(() => {
    const randomAction = config.actions[Math.floor(Math.random() * config.actions.length)];
    
    switch(randomAction) {
      case 'jump':
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        console.log('Bot sakradi');
        break;
        
      case 'moveForward':
        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 1000);
        console.log('Bot oldinga yurdi');
        break;
        
      case 'moveBackward':
        bot.setControlState('back', true);
        setTimeout(() => bot.setControlState('back', false), 1000);
        console.log('Bot orqaga yurdi');
        break;
        
      case 'strafeLeft':
        bot.setControlState('left', true);
        setTimeout(() => bot.setControlState('left', false), 1000);
        console.log('Bot chapga yurdi');
        break;
        
      case 'strafeRight':
        bot.setControlState('right', true);
        setTimeout(() => bot.setControlState('right', false), 1000);
        console.log('Bot o\'ngga yurdi');
        break;
        
      case 'lookAround':
        const yaw = Math.random() * Math.PI - (0.5 * Math.PI);
        const pitch = Math.random() * Math.PI - (0.5 * Math.PI);
        bot.look(yaw, pitch);
        console.log('Bot atrofga qaradi');
        break;
        
      case 'attackMobs':
        attackNearbyMobs(bot);
        break;
    }
  }, config.movementInterval);

  // Bot chiqib ketganda intervalni tozalash
  bot.on('end', () => clearInterval(interval));
}

// Botni ishga tushirish
startBot();