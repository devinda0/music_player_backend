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
}

module.exports = new SongConnection();