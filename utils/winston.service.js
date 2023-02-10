const winston = require('winston');
const {format} = require('winston');

const logger = winston.createLogger({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
    transports: [
      new winston.transports.Console()
    ]
});

module.exports = logger