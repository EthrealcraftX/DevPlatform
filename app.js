const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// === Port
const PORT = process.env.PORT || 8000;

// === View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Static Files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/logs', express.static(path.join(__dirname, 'logs')));

// === Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

// === Session
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false
}));

// === Toast Helper
app.use((req, res, next) => {
  res.locals.toast = req.session.toast;
  delete req.session.toast;
  next();
});

// === User Helper
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// === Socket.io setup
require('./socketManager')(io);

// === Route's 
const pingRoutes = require('./routes/ping');
app.use('/', require('./routes/index')); // index.js handles all subroutes
app.use('/', require('./routes/home'));
app.use('/project', pingRoutes);


// === 404 Not Found
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// === Start Server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
