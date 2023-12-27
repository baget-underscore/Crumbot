const pino = require('pino');
const oldlogger = pino();
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            include: 'level,time,msg',
            translateTime: 'HH:mm:ss',
        }
    },
});
oldlogger.info('Test');
logger.info('Test');
module.exports = logger;