const { createLogger, transports, format } = require('winston');
const fs = require('fs');
const path = require('path');

// Imposta la directory dove verranno salvati i log
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir); // Crea la directory se non esiste
}

// Configura il logger con livello 'info', formato JSON e timestamp
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Salva i log nel file payments.log dentro la directory logs
    new transports.File({ filename: path.join(logDir, 'payments.log') })
  ]
});

module.exports = logger;
