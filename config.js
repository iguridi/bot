process.env.NTBA_FIX_319 = 1

const TelegramBot = require('node-telegram-bot-api')
const KbW = require('node-telegram-keyboard-wrapper')
const Db = require('./dbhelper')

const ik = new KbW.InlineKeyboard()

const ENV = process.env.ENV || 'production'

const options = {
    production: {
        webHook: {
            // Port to which you should bind is assigned to $PORT variable
            // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
            port: process.env.PORT,
            // you do NOT need to set up certificates since Heroku provides
            // the SSL certs already (https://<app-name>.herokuapp.com)
            // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
        },
    },
    development: {
        polling: true,
    },
}

const token = process.env.TOKEN_BOT
const bot = new TelegramBot(token, options[ENV])

if (ENV === 'production') {
    // Heroku routes from port :443 to $PORT
    // Add URL of your app to env variable or enable Dyno Metadata
    // to get this automatically (it was enabled on 26/05/2020)
    // See: https://devcenter.heroku.com/articles/dyno-metadata
    const url = process.env.APP_URL || 'https://<app-name>.herokuapp.com:443'
    bot.setWebHook(`${url}/bot${token}`)
}

module.exports = {
    bot,
    db: new Db(),
    kbW: KbW,
    ik,
}
