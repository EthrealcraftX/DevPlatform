require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;


// Middleware: static files, body parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// View engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routing
const pageRoutes = require('./routes/index');
app.use('/', pageRoutes);

// API route (future: Telegram, webhooks, etc)
const apiRoutes = require('./api/bot');
app.use('/api', apiRoutes);

const projectManager = require('./utils/projectProcessManager');
projectManager.loadPIDs();



// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at:`);
    console.log(`  - http://localhost:${PORT}`);
});

