/*jshint esversion: 6 */


const sqlite3 = require('sqlite3').verbose();
 
class Db { 
    open() {
        // open database in memory
        this.db = new sqlite3.Database('db.db', (err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Connected to the SQlite database.');
        });
    }
     
    createTable(tableName) {
        this.db.run('CREATE TABLE IF NOT EXISTS ' + tableName + '(name text)', [], 
            function(err) {
            if (err) {
                return console.log(err.message);
            } else {
                console.log('Table ' + tableName + ' created');
            }
        });
    }

    dropTable(tableName) {
        // console.log(tableName, 'la mierda grande');
        this.db.run('DROP TABLE ' + tableName, [], function(err) {
            // console.log(tableName, 'la mierda grande2');
            if (err) {
                return console.log(err.message);
            }
        });
    }


    insert(tableName, item) {
        this.db.run('INSERT INTO ' + tableName + '(name) VALUES(?)', [item], 
            function(err) {
            if (err) {
                throw err;
            }
            // console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        // console.log(this.db.changes);
    }

    delete(tableName, item) {
        // console.log(tableName, item);
        let query = "DELETE FROM " + tableName + " WHERE name=?;";
        console.log(query);
        // query = "DELETE FROM list313130684 WHERE name = 'huevos';"
        this.db.run(query, [item], function(err) {
                console.log('shiet2');                
                if (err) {
                    throw err;
                    // return console.log(err.message);
            }
        });
    }

    getList(tableName, callback) {
        this.db.all("SELECT name FROM " + tableName, [], (err, rows) => {
            if( rows ) {
                callback(null, rows);
            } else {
                callback(null, []);
            }
        });
    }

    // close the database connection
    close() {
        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Close the database connection.');
        });
    }
}

module.exports = Db;
