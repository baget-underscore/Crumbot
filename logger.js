const pino = require('pino');
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            customColors: 'err:red,info:blue',
            ignore: 'pid,hostname',
            include: 'level,time,msg',
            translateTime: 'HH:mm:ss',
        }
    },
});
module.exports = logger;