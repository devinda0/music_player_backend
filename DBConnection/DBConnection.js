const { query } = require('express');
const mysql = require('mysql2');


class SongConnection {
    constructor(){
        this.pool = mysql.createPool({
            host:'localhost',
            user:'root',
            password:'Devinda0@',
            database:'songs'
        });
    }

    getSongs(){
        const getSongQuery = `  SELECT songs.songId as songId, image, title, url, group_concat(name separator ', ') AS authors
                                FROM ((songs_authors
                                INNER JOIN songs ON songs_authors.songId = songs.songId)
                                INNER JOIN  authors ON songs_authors.authorId = authors.authorId)
                                GROUP BY songId;`

        return new Promise( (resolve, reject) => {
            this.pool.getConnection( (err, con) => {
                if (err) return reject('connection error');
                con.query(getSongQuery, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error');
                    resolve(result);
                })
            })
        });
    }

    getSong(songId){
        const getSongQuery = `  SELECT songs.songId as songId, image, title, url, group_concat(name separator ', ') AS authors
                                FROM ((songs_authors
                                INNER JOIN songs ON songs_authors.songId = songs.songId)
                                INNER JOIN  authors ON songs_authors.authorId = authors.authorId)
                                WHERE songs.songId = ${songId}
                                GROUP BY songId;`

        return new Promise( (resolve, reject) => {
            this.pool.getConnection( (err, con) => {
                if (err) return reject('connection error');
                con.query(getSongQuery, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error');
                    resolve(result);
                })
            })
        });
    }

    getAuthors(songId){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('connection error');
                con.query(`SELECT name From songs_authors, authors
                            WHERE songs_authors.authorId = authors.authorId
                            AND songs_authors.songId = ${songId}`
                , (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error');
                    resolve(result);
                })
            })
        })
    }

    getUser(email){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection error');
                con.query(`SELECT password, userId FROM users WHERE email = "${email}" ;`,(queryErr, result) =>{
                    con.release();
                    if(queryErr) return reject('query error');
                    if(result.length > 0) resolve(result);
                    else reject('user not found');
                })
            })
        })
    }

    getUserById(userId){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection error');
                con.query(`SELECT * FROM users WHERE userId = ${userId} ;`,(queryErr, result) =>{
                    con.release();
                    if(queryErr) return reject('query error');
                    if(result.length > 0) resolve(result);
                    else reject('user not found');
                })
            })
        })
    }

    addToken(userId, token){
        return new Promise((resolve, reject) => {
            console.log(userId, token);
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection error');
                con.query(` INSERT INTO tokens
                                (userId, token)
                            VALUES( ${userId} , "${token}");`, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error');
                    resolve(result);
                })
            })
        })
    }

    getTokenDetails(token){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection error');
                con.query(`SELECT userId, token FROM tokens WHERE token = "${token}";`, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error', queryErr);
                    resolve(result);
                })
            })
        })
    }

    isUserExists(email){
        const query = `
            SELECT * 
            FROM users
            WHERE email = "${email}";
        `

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) reject(err);
                con.query(query, (queryErr, result) => {
                    con.release();
                    if(queryErr) reject(queryErr);
                    if(result.length > 0) resolve(true);
                    else resolve(false);
                })
            })
        })
    }

    addUser(user){
        const query = `
            INSERT INTO users
                (f_name, l_name, email, password)
            VALUES ("${user.f_name}","${user.l_name}","${user.email}","${user.password}");
        `

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject(err);
                con.query(query, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject(queryErr);
                    resolve(result.insertId);
                })
            })
        })
    }

    deleteToken(token){
        const query = `
            DELETE FROM tokens WHERE token="${token}";
        `

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection error');
                con.query(query, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error');
                    console.log(result);
                    resolve(true);
                })
            })
        })
    }

    getPlaylists(userId){
        const query = `
            SELECT playlistId, name, image, description 
            FROM playlists
            WHERE userId = ${userId};
        `

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection error');
                con.query(query,(queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query error');
                    resolve(result);
                })
            })
        })
    }

    createPlaylist(playlist){
        const query = `
            INSERT INTO playlists
                (userId, name, image, description)
            VALUES (${playlist.userId}, "${playlist.name}", "${playlist.image}", "${playlist.description}");
        `

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject('DB connection err');
                con.query(query, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject('query Error');
                    resolve(result);
                })
            })
        })
    }

    query(query){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if(err) return reject(err);
                con.query(query, (queryErr, result) => {
                    con.release();
                    if(queryErr) return reject(queryErr);
                    resolve(result);
                })
            })
        })
    }
}

module.exports = new SongConnection();