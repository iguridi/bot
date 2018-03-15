/*jshint esversion: 6 */

process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const Db = require('./dbhelper');
let db = new Db();
const config = require('./config');



// Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

var tableName = 'list';
// db.open();

/* 
start
*/
bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    let id = chatId.toString().replace('-', '');
    // tableName += chatId;
    console.log(tableName + id);
    db.createTable(tableName + id);
    bot.sendMessage(chatId, "Hello");
});


// Matches "/add [whatever]"
bot.onText(/\/add (.+)/, add);
bot.onText(/\/[a-z]*falta[a-z]* (.+)/, add);


function addProduct(chatId, items) {
    return function(err, data) {
        const a = [];
        for( let i in items ) {
            let item = items[i];
            if (err) {
                throw err;
            }
            b = [];
            for( let i in data ) {
                b.push(data[i].name);
            }
            console.log(b);
            if( b.includes(item) ) {
                // bot.sendMessage(chatId, 'Ya sé que falta(n) ' + item + ', gracias');
                bot.sendMessage(chatId, 'Product ' + item + ' already added');
            } else {
                console.log(tableName, chatId);
                db.insert(tableName + chatId.toString().replace('-', ''), item);
                a.push(item);
                // bot.sendMessage(chatId, 'Product ' +  item  + ' added');
            }
        }
        if( a.length > 0 ) {
            // bot.sendMessage(chatId, 'Ya');
            bot.sendMessage(chatId, 'Product(s) ' +  a.join(', ')  + ' added');
        }
    };
}


function removeDuplicates(list) {
    var seen = {};
    return list.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}


function add(msg, match) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    
    const chatId = msg.chat.id;
    if( match[1] !== undefined ) {
        // here we handle the word format
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());        
        items = removeDuplicates(items);

        db.getList(tableName + chatId.toString().replace('-', ''), addProduct(chatId, items));
    }
}


function removeAll(msg) {
    const chatId = msg.chat.id;
    db.dropTable(tableName + chatId.toString().replace('-', ''));
    db.createTable(tableName + chatId.toString().replace('-', ''));
    // bot.sendMessage(chatId, 'Lista vaciada');
    bot.sendMessage(chatId, 'List emptied');
}


bot.onText(/\/removeall/, removeAll);
bot.onText(/\/borrartodo/, removeAll);


function remove(msg, match) {
    const chatId = msg.chat.id.toString();
    // console.log(match[1], 'shit');
    if (match[1] !== '') {
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());
        for (let i in items) {
            db.delete(tableName + chatId.toString().replace('-', ''), items[i]);

        }
        // bot.sendMessage(chatId, 'Producto(s) ' + items.join(', ') + ' borrado(s) de la lista');
        bot.sendMessage(chatId, 'Item(s) ' + items.join(', ') + ' removed');
    } else {
        // console.log('No item specified');
        // bot.sendMessage(chatId, 'Que producto');
        bot.sendMessage(chatId, 'No item specified');
    }

}

bot.onText(/\/remove (.*)/, remove);
bot.onText(/\/borrar (.*)/, remove);



function showList(msg) {
    return function(err, list) {
        if (err) {
            throw err;
        }
        // console.log(list, 'lablabla');

        const chatId = msg.chat.id;
        var resp = "List:\n";
        // var resp = "List:\n";

        if( list.length === 0 ) {
            // resp = "Lista vacía";
            resp = "Empty list";
        } else {
            for( let i in list ) {
                resp += "- " + list[i].name + "\n";
            }
        }
        bot.sendMessage(chatId, resp); //, {parse_mode: "HTML"});
    };
}


bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;     
    db.getList(tableName + chatId.toString().replace('-', ''), showList(msg));
});

