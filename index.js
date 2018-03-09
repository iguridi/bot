/*jshint esversion: 6 */

process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const Db = require('./dbhelper');
let db = new Db();

db.open();
db.createTable();


// Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
bot = new TelegramBot("486635226:AAEHlZe4KGZSauh2jHDHBpQrvN3nQQr9-oc", 
    { polling: true });


// Matches "/add [whatever]"
bot.onText(/\/add (.+)/, add);
bot.onText(/\/*falta (.+)/, add);


function addProduct(chatId, items) {
    return function(err, data) {
        const a = [];
        for( let i in items ) {
            let item = items[i];
            // here we handle the word format
            // item = items[i].trim().toLowerCase();
            if (err) {
                throw err;
            }
            b = [];
            for( let i in data ) {
                b.push(data[i].name);
            }
            console.log(b);
            if( b.includes(item) ) {
                bot.sendMessage(chatId, 'Ya sé que falta(n) ' + item + ', gracias');
                // bot.sendMessage(chatId, 'Product ' + item + ' already added');
            } else {
                db.insert(item);
                a.push(item);
                // bot.sendMessage(chatId, 'Product ' +  item  + ' added');
            }
        }
        if( a.length > 0 ) {
            bot.sendMessage(chatId, 'Ya');
            // bot.sendMessage(chatId, 'Product(s) ' +  a.join(', ')  + ' added');
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
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());

        items = removeDuplicates(items);
        // console.log(items);
        // var items = removeDuplicates(match[1].split(','));
        db.getList(addProduct(chatId, items));
    }
}


bot.onText(/\/removeall/, (msg) => {
    db.dropTable();
    db.createTable();
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'List emptied');
});

bot.onText(/\/remove(.*)/, (msg, match) => {
    const chatId = msg.chat.id; 
    console.log(match[1], 'shit');
    if( match[1] !== '' ) {
        let items = match[1].split(',').map((s) => s.trim().toLowerCase());
        for( let i in items ) {
            db.delete(items[i]);
        }
        bot.sendMessage(chatId, 'Item(s) ' + items.join(', ') +' removed');
    } else {
        // console.log('No item specified');
        bot.sendMessage(chatId, 'No item specified');
    }
    
});
// bot.onText(/\/listo/, (msg, match) => {



function showList(msg) {
    return function(err, list) {
        if (err) {
            throw err;
        }
        // console.log(list, 'lablabla');

        const chatId = msg.chat.id;
        var resp = "List:\n";

        if( list.length === 0 ) {
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
    // console.log('blabla');
    db.getList(showList(msg));
    // let list = db.blu();
    // console.log(list, 'lablabla');

    // const chatId = msg.chat.id;
    // var resp = "List:\n";

    // if( list.length === 0 ) {
    //     resp = "Empty list";
    // } else {
    //     for( i in list ) {
    //         resp += "- " + list[i] + "\n";
    //     }
    // }
    // bot.sendMessage(chatId, resp); //, {parse_mode: "HTML"});
});




// bot.on('polling_error', (error) => {
//   console.log(error.response.body);  // => 'EFATAL'
// });

// show the values stored
// for (var k in h) {
//     // use hasOwnProperty to filter out keys from the Object.prototype
//     if (h.hasOwnProperty(k)) {
//         alert('key is: ' + k + ', value is: ' + h[k]);
//     }
// }