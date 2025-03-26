const pino = require('pino');
const transport = pino.transport({
        targets: [
            {
                level: 'trace',
                target: 'pino/file',
                options: {
                    destination: `./logs/${ new Date().toISOString().slice(0, 10) }_log.log`,
                },
            },
            {
                level: 'error',
                target: 'pino/file',
                options: {
                    destination: `./logs/${ new Date().toISOString().slice(0, 10) }_errors.log`,
                },
            },
            {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    customColors: 'err:red,info:blue',
                    ignore: 'pid,hostname',
                    include: 'level,time,msg',
                    translateTime: 'HH:mm:ss',
                },
            },
        ],
});
module.exports = pino(transport);