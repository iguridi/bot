/*jshint esversion: 6 */


const sqlite3 = require('sqlite3').verbose();
 
class Db { 
    open() {
        // open database in memory
        this.db = new sqlite3.Database('db.db', (err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Connected to the in-memory SQlite database.');
        });
    }
     
    createTable() {
        this.db.run('CREATE TABLE IF NOT EXISTS list(name text)', [], 
            function(err) {
            if (err) {
                return console.log(err.message);
            } else {
                console.log('Table list created');
            }
        });
    }

    dropTable() {
        this.db.run('DROP TABLE list', [], function(err) {
            if (err) {
                return console.log(err.message);
            }
        });
    }

    insert(item) {
        // console.log(item, 'la shit');
        this.db.run('INSERT INTO list(name) VALUES(?)', [item], 
            function(err) {
            if (err) {
                throw err;
            }
            // console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        // console.log(this.db.changes);
    }

    delete(item) {
        this.db.run('DELETE FROM list WHERE name=?', [item], 
            function(err) {
            if (err) {
                return console.log(err.message);
            }
        });
    }

    getList(callback) {
        // let rows = [];
        this.db.all("SELECT name FROM list", [], (err, rows) => {
            if( rows ) {
            // console.log(rows);
                callback(null, rows);
            } else {
                callback(null, []);
            }
        });
        // return rows;
    }

    // blu() {
    //     // return 'ayayay';
    //     let r = [];
    //     this.db.all("SELECT name FROM list", [], (err, rows) => {
    //       if (err) {
    //         throw err;
    //       }
    //       r = rows;
    //       // rows.forEach((row) => {
    //       //   console.log(row.name);
    //       // });
    //     });
    //     return r;
    //     // return 'la shit';
    // }


    // db.serialize(() => {
    //   db.all("SELECT * FROM products", (err, rows) => {
    //     if (err) {
    //       console.error(err.message);
    //     }
    //     console.log(rows);
    //   });
    // });


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

// class Poligono {
//   constructor(height, width) {
//     this.height = height;
//     this.width = width;
//   }
  
//   get area() {
//     return this.calcArea();
//   }

//   calcArea() {
//     return this.height * this.width;
//   }
// }

// class DBHelper:
//     def __init__(self, dbname="db.db"):
//         self.dbname = dbname
//         self.conn = sqlite3.connect(dbname)

//     def setup(self):
//         stmt = "CREATE TABLE IF NOT EXISTS items (description text)"
//         self.conn.execute(stmt)
//         self.conn.commit()

//     def add_item(self, item_text):
//         stmt = "INSERT INTO items (description) VALUES (?)"
//         args = (item_text, )
//         self.conn.execute(stmt, args)
//         self.conn.commit()

//     def delete_item(self, item_text):
//         stmt = "DELETE FROM items WHERE description = (?)"
//         args = (item_text, )
//         self.conn.execute(stmt, args)
//         self.conn.commit()

//     def get_items(self):
//         stmt = "SELECT description FROM items"
//         return [x[0] for x in self.conn.execute(stmt)]