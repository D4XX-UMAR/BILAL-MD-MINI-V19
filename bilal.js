// MDE IN BY INCONNU BOY 

const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 10000; 
const pairRoutes = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/code', pairRoutes); 
app.get('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html')
});
app.get('/', async (req, res, next) => {
    res.sendFile(__path + '/main.html')
});


app.on('listening', () => {
  console.log(`
INCONNU BOY IS THE BEST 👋 
Server running on http://0.0.0.0:${PORT}
`);
  
  
  setTimeout(async () => {
    try {
      const { autoReconnectFromMongoDB } = require('./pair');
      await autoReconnectFromMongoDB();
      console.log('✅ Auto-reconnect completed');
    } catch (error) {
      console.error('❌ Auto-reconnect failed:', error.message);
    }
  }, 5000);
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Server started...');
});

module.exports = app;
