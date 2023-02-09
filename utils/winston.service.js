const winston = require('winston');
const {format} = require('winston')

// const levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// };

const logger = winston.createLogger({
    format: format.simple(),
    transports: [
      new winston.transports.Console()
    ]
});

module.exports = logger