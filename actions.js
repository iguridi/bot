const { bot, db, kbW } = require('./config')

const tableName = 'list'

const ik = new kbW.InlineKeyboard()

async function addProduct(chatId, items, list) {
    // this fuction checks that item is not already added to the list
    const newItems = []
    const proms = []
    for (let i in items) {
        let item = items[i]
        if (!item) {
            continue
        }
        const itemNames = list.map((i) => i.name)
        if (!itemNames.includes(item)) {
            proms.push(db.insert(tableName + chatId.toString().replace('-', ''), item))
            newItems.push(item)
        }
    }
    await Promise.all(proms)
    sendList(chatId)
}

function removeDuplicates(list) {
    const seen = {}
    return list.filter((item) => (seen.hasOwnProperty(item) ? false : (seen[item] = true)))
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

async function sendList(chatId) {
    const list = await db.getList(tableName + chatId.toString().replace('-', ''))
    try {
        let resp = '<b>List</b>\n'
        if (!list) {
            resp += '-  '
        }
        for (let i in list) {
            resp += '-  ' + capitalizeFirstLetter(list[i].name) + '\n'
        }
        bot.sendMessage(chatId, resp, { parse_mode: 'HTML' })
    } catch (err) {
        err
    }
}

function closeRemove(chat_id, message_id) {
    bot.deleteMessage(chat_id, message_id)
    sendList(chat_id)
}

module.exports = {
    start(msg) {
        const chatId = msg.chat.id
        let id = chatId.toString().replace('-', '')
        db.createTable(tableName + id)
        bot.sendMessage(chatId, 'Hello')
    },

    addNull(msg) {
        const chatId = msg.chat.id
        bot.sendMessage(chatId, 'No product specified')
    },

    async add(msg, match) {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content of the message
        const chatId = msg.chat.id
        if (match[1] === undefined) {
            return
        }
        // here we handle the word format
        let items = match[1].split(',').map((s) => s.trim().toLowerCase())
        items = removeDuplicates(items)

        const list = await db.getList(tableName + chatId.toString().replace('-', ''))
        addProduct(chatId, items, list)
    },

    async removeAll(msg) {
        const chatId = msg.chat.id
        // db.dropTable(tableName + chatId.toString().replace('-', ''));
        const tableName2 = tableName + chatId.toString().replace('-', '')
        try {
            await db.dropTable(tableName2)
            await db.createTable(tableName2)
            sendList(chatId)
        } catch (e) {
            e
        }
    },

    async remove(msg, match) {
        const chatId = msg.chat.id.toString()
        const proms = []
        if (match[1] === '') {
            return
        }
        const items = match[1].split(',').map((s) => s.trim().toLowerCase())
        for (let i in items) {
            let item = items[i]
            proms.push(db.delete(tableName + chatId.toString().replace('-', ''), item))
        }
        await Promise.all(proms)
        sendList(chatId)
    },

    async removeNull(msg) {
        const chatId = msg.chat.id.toString()
        const list = await db.getList(tableName + chatId.toString().replace('-', ''))
        ik.reset()
        for (let i = 0; i < list.length; i++) {
            const name = list[i].name
            // 64 size string limit for callback data
            const callback_data = name.slice(0, 64)
            ik.addRow({ text: capitalizeFirstLetter(name), callback_data })
        }
        ik.addRow({ text: '✔️', callback_data: 'CLOSE' })
        bot.sendMessage(chatId, 'Remove', ik.build())
    },

    removedCallback(query) {
        const chat_id = query.message.chat.id
        const message_id = query.message.message_id
        const list = ik.build().reply_markup.inline_keyboard
        if (query.data == 'CLOSE') {
            closeRemove(chat_id, message_id)
            return
        }
        db.delete(tableName + chat_id.toString().replace('-', ''), query.data)
        bot.answerCallbackQuery(query.id, { text: capitalizeFirstLetter(query.data) + ' removed!' })
        if (list.length === 2) {
            // no items left on list
            closeRemove(chat_id, message_id)
            return
        }

        for (let i = 0; i < list.length; i++) {
            if (list[i][0].callback_data === query.data) {
                ik.removeRow(i)
            }
        }
        bot.editMessageReplyMarkup(ik.build().reply_markup, { message_id, chat_id })
    },

    sendList(msg) {
        sendList(msg.chat.id)
    },
}
