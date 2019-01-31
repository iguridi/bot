const {bot, db} = require('./config');

const tableName = 'list';


async function addProduct(chatId, items, list) {
    // this fuction checks that item is not already added to the list
    const newItems = [];
    const proms = [];
    (items, 'cfejk')
    for( let i in items ) {
        let item = items[i];
        if ( !item ) {
            continue;
        }
        const itemNames = list.map((i) => i.name)
        (itemNames, 'blajbkjhsbc');
        if( !itemNames.includes(item) ) {
            proms.push(db.insert(tableName + chatId.toString().replace('-', ''), item));
            newItems.push(item);
        }
    }
    await Promise.all(proms);
    sendList(chatId);
}


function removeDuplicates(list) {
    const seen = {};
    return list.filter((item) => seen.hasOwnProperty(item) ? false : seen[item] = true);
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


async function sendList(chatId) {
    const list = await db.getList(tableName + chatId.toString().replace('-', ''))
    try {
        let resp = '<b>List</b>\n';
        if( !list ) {
            resp += '-  '
        }
        for( let i in list ) {
            resp += '-  ' + capitalizeFirstLetter(list[i].name) + '\n';
        }
        bot.sendMessage(chatId, resp, {parse_mode: "HTML"});
    } catch (err) {
        (err);
    }
}

module.exports = {
    start(msg) {
        const chatId = msg.chat.id;
        let id = chatId.toString().replace('-', '');
        db.createTable(tableName + id);
        bot.sendMessage(chatId, "Hello");
    },

    addNull(msg) {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'No product specified');
    },

    async add(msg, match) {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content of the message
        const chatId = msg.chat.id;
        if( match[1] === undefined ) {
            return;
        }
        // here we handle the word format
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());
        (match[1],'ncdjbnw')
        items = removeDuplicates(items);

        const list = await db.getList(tableName + chatId.toString().replace('-', ''))
        ('nlabla', list)
        addProduct(chatId, items, list);
    },

    async removeAll(msg) {
        const chatId = msg.chat.id;
        // db.dropTable(tableName + chatId.toString().replace('-', ''));
        const tableName2 = tableName + chatId.toString().replace('-', '');
        try {
            await db.dropTable(tableName2);
            await db.createTable(tableName2);
            sendList(chatId);
        } catch(e) {
            (e);
        }
    },

    async remove(msg, match) {
        const chatId = msg.chat.id.toString();
        const proms = [];
        if( match[1] === '' ) {
            return;
        }
        const items = match[1].split(',').map((s) => s.trim().toLowerCase());
        for( let i in items ) {
            let item = items[i];
            proms.push(db.delete(
                    tableName + chatId.toString().replace('-', ''), item)
            );
        }
        await Promise.all(proms);
        sendList(chatId);

    },

    sendList(msg){
        sendList(msg.chat.id);
    },
}