process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const Db = require('./dbhelper');
// const Actions = require('./actions');

// let db = new Db();

module.exports = {
    bot: new TelegramBot(process.env.TOKEN_BOT, { polling: true }),
    db: new Db(),
}