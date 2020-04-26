const { bot, db, kbW } = require('./config')

const BASE_TABLE_NAME = 'list'

const IK = new kbW.InlineKeyboard()

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
            proms.push(db.insert(getTableName(chatId), item))
            newItems.push(item)
        }
    }
    await Promise.all(proms)
}

const sendList = async (chatId) => {
    const list = await db.getList(getTableName(chatId))
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

function removeDuplicates(list) {
    const seen = {}
    return list.filter((item) => (seen.hasOwnProperty(item) ? false : (seen[item] = true)))
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

const getTableName = (chatId) => BASE_TABLE_NAME + chatId.toString().replace('-', '')

function closeRemove(chatId, messageId) {
    bot.deleteMessage(chatId, messageId)
    sendList(chatId)
}

module.exports = {
    start(msg) {
        const chatId = msg.chat.id
        db.createTable(getTableName(chatId))
        console.log('New start ' + chatId)
        bot.sendMessage(chatId, 'Hello')
    },

    addNull(msg) {
        const chatId = msg.chat.id
        console.log('"Add" command with no product specified')
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

        const list = await db.getList(getTableName(chatId))
        console.log(`Add "${items}" from ${chatId}`)
        await addProduct(chatId, items, list)
        sendList(chatId)
    },

    async removeAll(msg) {
        const chatId = msg.chat.id
        const tableName = getTableName(chatId)
        try {
            console.log(`Reset table "${tableName}"`)
            await db.dropTable(tableName)
            await db.createTable(tableName)

            sendList(chatId)
        } catch (e) {
            console.log(`Problem when reseting table ${tableName}`)
        }
    },

    async remove(msg, match) {
        const chatId = msg.chat.id.toString()
        const proms = []
        if (match[1] === '') {
            return
        }
        const tableName = getTableName(chatId)
        const items = match[1].split(',').map((s) => s.trim().toLowerCase())
        console.log(`Remove "${items}" from ${tableName}`)
        for (let i in items) {
            let item = items[i]
            proms.push(db.delete(tableName, item))
        }
        await Promise.all(proms)
        sendList(chatId)
    },

    async showListToRemove(msg) {
        const chatId = msg.chat.id.toString()
        console.log(`Show list to remove products ${chatId}`)
        const list = await db.getList(getTableName(chatId))
        IK.reset()
        for (let i = 0; i < list.length; i++) {
            const name = list[i].name
            // 64 size string limit for callback data
            const callback_data = name.slice(0, 64)
            IK.addRow({ text: capitalizeFirstLetter(name), callback_data })
        }
        IK.addRow({ text: '✔️', callback_data: 'CLOSE' })

        bot.sendMessage(chatId, 'Remove', IK.build())
    },

    removedCallback(query) {
        const chatId = query.message.chat.id
        const messageId = query.message.message_id
        const list = IK.build().reply_markup.inline_keyboard
        if (query.data == 'CLOSE') {
            console.log(`Closing remove list from ${chatId}`)
            closeRemove(chatId, messageId)
            return
        }
        console.log(query, 'askjbf')
        const tableName = getTableName(chatId)
        console.log(`Remove "${query.data}" from ${tableName} via buttons`)
        db.delete(tableName, query.data)
        bot.answerCallbackQuery(query.id, { text: capitalizeFirstLetter(query.data) + ' removed!' })
        if (list.length === 2) {
            // no items left on list
            closeRemove(chatId, messageId)
            return
        }

        for (let i = 0; i < list.length; i++) {
            if (list[i][0].callback_data === query.data) {
                IK.removeRow(i)
            }
        }
        bot.editMessageReplyMarkup(IK.build().reply_markup, {
            message_id: messageId,
            chat_id: chatId,
        })
    },

    sendList(msg) {
        const chatId = msg.chat.id
        console.log(`Show list of ${chatId}`)
        sendList(chatId)
    },
}
