/*jshint esversion: 6 */


// import { WSAEPROCLIM } from 'constants'; esto noseé porqué está acá
const pg = require('pg');

function newClient() {
    const client = new pg.Client({
        // connectionString: 'postgres://ignacio@localhost:5432/db',
        connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/db',
        ssl: true
    });
    client.connect();
    return client;
}

class Db { 
     
    createTable(tableName) {
        return new Promise((resolve, reject) => {
            const client = newClient();
            const query = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(name text);';
            client.query(query, (err, res) => {
                if (err) reject("couldn't create table " + tableName);
                console.log('table ' + tableName + ' created');
                client.end();
            }); 
            resolve('cool');
        });
    }

    dropTable(tableName) {
        return new Promise((resolve, reject) => {
            const client = newClient();
            client.query('DROP TABLE ' + tableName + ';', (err, res) => {
                if (err) reject('could not  drop table ' + tableName);
                console.log('table ' + tableName + ' dropped');
                client.end();
                resolve('cool');
            });

        });
    }


    insert(tableName, item) {
        return new Promise((resolve, reject) => {
            const client = newClient();
            console.log(item);
            client.query('INSERT INTO ' + tableName + '(name) VALUES($1)', [item],
                (err, res) => {
                    if (err) reject(err);
                    console.log(item + ' inserted');
                    client.end();
                    resolve('cool');
                }
            );
        });
        
    }

    delete(tableName, item) {
        // aca vot my friend. 
        return new Promise((resolve, reject) => {
            const client = newClient();
            console.log(item);
            client.query("DELETE FROM " + tableName + " WHERE name=($1);", [item],
                (err, res) => {
                    if (err) reject(err);
                    console.log(item + ' deleted');
                    client.end();
                    resolve('cool');
                }
            );
        });
        // // console.log(tableName, item);
        // let query = "DELETE FROM " + tableName + " WHERE name=?;";
        // console.log(query);
        // // query = "DELETE FROM list313130684 WHERE name = 'huevos';"
        // this.db.run(query, [item], function(err) {
        //         console.log('shiet2');                
        //         if (err) {
        //             throw err;
        //             // return console.log(err.message);
        //     }
        // });
    }

    getList(tableName, callback) {
        return new Promise((resolve, reject) => {
            const client = newClient();
            const query = "SELECT name FROM " + tableName;
            console.log(query, 'blablaa');
            client.query(query, (err, res) => {
                if (err) reject(err);
                if (res) {
                    callback(null, res.rows);
                } else {
                    callback(null, []);
                }
                resolve('cool');
                // console.log('table ' + tableName + ' created');
                client.end();
            }); 
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
