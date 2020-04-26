/*jshint esversion: 6 */
require('dotenv').config()
const { bot } = require('./config')
const Actions = require('./actions')

/*
start
*/
bot.onText(/\/start/, Actions.start)

// Matches "/add [whatever]"
bot.onText(/\/add[^ ]* *(?!.)/, Actions.addNull)
bot.onText(/\/add[^ ]* (.+)/, Actions.add)

bot.onText(/\/removeall/, Actions.removeAll)

bot.onText(/\/remove (.*)/, Actions.remove)
bot.onText(/\/remove$/, Actions.showListToRemove)

bot.onText(/\/list/, Actions.sendList)

bot.on('callback_query', Actions.removedCallback)
