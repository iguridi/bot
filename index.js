/*jshint esversion: 6 */

process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const Db = require('./dbhelper');
let db = new Db();
let tokenBot = '';
try {
    const config = require('./config');
    tokenBot = config.BOT_TOKEN;
} catch(e) {}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
bot = new TelegramBot(process.env.TOKEN_BOT || tokenBot, { polling: true });

var tableName = 'list';
// db.open();

/* 
start
*/
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    let id = chatId.toString().replace('-', '');
    // tableName += chatId;
    console.log(tableName + id);
    db.createTable(tableName + id);
    bot.sendMessage(chatId, "Hello");
});


// Matches "/add [whatever]"
bot.onText(/\/add[^ ]* *(?!.)/, msg => { 
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'No product specified');
});
bot.onText(/\/add[^ ]* (.+)/, add);
bot.onText(/\/[a-z]*falta[a-z]* (.+)/, add);


function addProduct(chatId, items, list) {
    // this fuction checks that item is not already added to the list
    const newItems = [];
    const proms = [];
    for( let i in items ) {
        let item = items[i];
        if ( item ) {
            const itemNames = [];
            for( let i in list ) {
                itemNames.push(list[i].name);
            }
            if( !itemNames.includes(item) ) {
                proms.push(db.insert(
                    tableName + chatId.toString().replace('-', ''), item)
                        .then(x => newItems.push(item))
                );
            }
        }
    }
    Promise.all(proms).then(x => sendList(chatId));
}


function removeDuplicates(list) {
    var seen = {};
    return list.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}


async function add(msg, match) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    
    const chatId = msg.chat.id;
    if( match[1] !== undefined ) {
        // here we handle the word format
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());        
        items = removeDuplicates(items);

        const list = await db.getList(tableName + chatId.toString().replace('-', ''))
        addProduct(chatId, items, list);
    } 
}


async function removeAll(msg) {
    const chatId = msg.chat.id;
    // db.dropTable(tableName + chatId.toString().replace('-', ''));
    const tableName2 = tableName + chatId.toString().replace('-', '');
    try {
        await db.dropTable(tableName2);
        await db.createTable(tableName2);
        sendList(chatId);
    } catch(e) {
        console.log(e);
    }
}


bot.onText(/\/removeall/, removeAll);
bot.onText(/\/borrartodo/, removeAll);


function remove(msg, match) {
    const chatId = msg.chat.id.toString();
    const proms = [];
    if( match[1] !== '' ) {
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());
        for( let i in items ) {
            let item = items[i];
            proms.push(db.delete(
                    tableName + chatId.toString().replace('-', ''), item)
            );
        }
    }
    Promise.all(proms).then(x => sendList(chatId));

}

bot.onText(/\/remove (.*)/, remove);
bot.onText(/\/borrar (.*)/, remove);


function sendList(chatId) {
    db.getList(tableName + chatId.toString().replace('-', '')) 
        .then(list => {
            let resp = '<b>List</b>\n';
            if( !list ) {
                resp += '-  '
            }
            for( let i in list ) {
                resp += '-  ' + capitalizeFirstLetter(list[i].name) + '\n';
            }
            bot.sendMessage(chatId, resp, {parse_mode: "HTML"});
        })
        .catch(err => console.log(err));
}


bot.onText(/\/list/, (msg) => {
    sendList(msg.chat.id);
});

