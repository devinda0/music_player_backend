const express = require('express');

const router = express.Router();
const database = require('../DBConnection/DBConnection');

router.use(express.json());

const generateToken = () => {
    const timeNow = Date.now().toString(36);
    const randomValue = Math.random().toString(36).substring(2);
    return randomValue + timeNow;
}

router.post('/login',async (req, res) => {
    const {email , password} = req.body;

    if(email){
        database.getUser(email)
            .then((result) => {
                if(password == result[0].password){
                    const token = generateToken();
                    database.addToken(result[0].userId,token)
                        .then((newResult) => {
                            res.status(200).send({
                                token : token
                            });
                        })
                        .catch((err) => {
                            console.log(err)
                            res.status(500).send({
                                message : "The server is not ready"
                            })
                        });
                } else {
                    res.status(401).send({
                        message : "email or password is incorrect"
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message: "The sever is not ready"
                });
            })
    } else {
        res.status(401).send({
            message : "email cannot be empty"
        })
    }
})

router.get('/login', (req, res) => {
    let token =req.headers.authorization;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    database.getTokenDetails(token)
        .then((result) => {
            if(result.length>0){
                res.status(200).send(result[0]);
            } else {
                res.status(404).send({
                    message: 'invalid token'
                })
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send({
                message: 'Server not ready'
            })
        })
})

router.post('/signup/',(req, res) => {
    database.isUserExists(req.body.email).then((userExists) => {
        if(userExists){
            res.statusMessage = 'user already exists'
            res.status(402).send();
        }else {
            database.addUser(req.body).then( (userId) => {
                const token = generateToken();
                database.addToken(userId,token).then((result) => {
                    res.status(200).send({
                        token : token
                    });
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({
                        message : "account creation success... you need to login"
                    });
                })
            }).catch((err) => {
                console.log(err);
                res.status(500).send({
                    message : "server is not ready"
                });
            })
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send({
            message : "server is not ready"
        });
    })
})

router.delete('/logout', (req, res) => {
    let token =req.headers.authorization;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    database.deleteToken(token)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((err) => {
            res.status(500).send(err);
        })
})

router.get('/playlists/', (req, res) => {
    let token =req.headers.authorization;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    database.getTokenDetails(token)
        .then((result) => {
            if(result.length > 0){
                const userId = result[0].userId;

                database.getPlaylists(userId)
                    .then((playlists) => {
                        res.status(200).send(playlists);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({
                            message : "server is not ready"
                        });
                    })

            } else {
                res.status(404).send('user not found');
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                message : "server is not ready"
            });
        })
})

router.post('/playlist/', (req, res) => {
    let token =req.headers.authorization;
    let name = req.body.name;

    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    database.getTokenDetails(token)
        .then(async (result) => {
            if(result.length > 0){
                const userId = result[0].userId;
                let user;

                await database.getUserById(userId).then((result) => user = result);
                console.log(user);

                const description = 'Created by ' + user[0].f_name;
                const image = '1Dka4Owadz5FIFFRpaKVmXFtDZoAM3CJt';
                
                const playlist = {
                    userId,
                    name,
                    description,
                    image
                }

                database.createPlaylist(playlist)
                    .then((result) => {
                        res.status(200).send();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({
                            message : "server is not ready"
                        });
                    })

            } else {
                res.status(404).send('user not found');
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                message : "server is not ready-1"
            });
        })
} )

router.get('/displaydata/', (req, res) => {
    let displayData = [];

    let token =req.headers.authorization;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    database.getTokenDetails(token)
        .then( async (result) => {
            if(result.length > 0){
                const userId = result[0].userId;

                const userPlaylists = `
                    SELECT playlistId, name, image, description
                    FROM playlists
                    WHERE userId = ${userId};
                `;

                const othersPlaylists = `
                    SELECT playlistId, name, image, description
                    FROM playlists
                    WHERE userId != ${userId};
                `;

                await database.query(userPlaylists).then((result) => {
                    let userPlaylistsData = {
                        name : 'From You',
                        items : result,
                        type : 'playlist'
                    }
                    displayData.push(userPlaylistsData);
                });

                await database.query(othersPlaylists).then((result) => {
                    let userPlaylistsData = {
                        name : 'From Others',
                        items : result,
                        type : 'playlist'
                    }
                    displayData.push(userPlaylistsData);
                });

                res.status(200).send(displayData);

            } else {
                res.status(404).send('user not found');
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                message : "server is not ready"
            });
        })

})

router.get('/playlists/:id', async (req, res) => {
    const playlistId = req.params.id;
    let token =req.headers.authorization;
    let songId = req.body.songId;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    let canAddSongs;

    const ownUser = `
        SELECT * 
        FROM (tokens INNER JOIN playlists ON tokens.userId = playlists.userId)
        WHERE token = '${token}' AND playlistId = ${playlistId};
    `

    await database.query(ownUser)
        .then((result) => canAddSongs = result.length > 0)
        .catch((err) => console.log(err));

    const getPlaylist = `
        SELECT * 
        FROM playlists
        WHERE playlistId = ${playlistId};
    `;

    database.query(getPlaylist)
        .then((playlist) => {
            const getSongs = `
                SELECT songs.songId as songId, image, title, url, group_concat(name separator ', ') AS authors
                FROM (((songs_authors
                    INNER JOIN songs ON songs_authors.songId = songs.songId)
                    INNER JOIN  authors ON songs_authors.authorId = authors.authorId)
                    INNER JOIN playlists_songs ON playlists_songs.songId = songs.songId)
                WHERE playlistId = ${playlistId}
                GROUP BY songId;
            `
            database.query(getSongs)
                .then((songs) => {
                    res.status(200).send({
                        playlist : playlist[0], 
                        songs,
                        canAddSongs
                    });
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({
                        message : "server is not ready"
                    });
                })

        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                message : "server is not ready"
            });
        })
})

router.post('/search/', (req, res) => {
    console.log(req.body);

    const searchText = req.body.searchText;

    const query = `
        SELECT songs.songId as songId, image, title, url, group_concat(name separator ', ') AS authors
        FROM ((songs_authors
        INNER JOIN songs ON songs_authors.songId = songs.songId)
        INNER JOIN  authors ON songs_authors.authorId = authors.authorId)
        WHERE title LIKE '%${searchText}%'
        GROUP BY songId;
    `

    database.query(query).then((result) => {
        res.status(200).send({
            searchResult : result
        })
    }).catch((err) => {
        res.status(500).send({
            err 
        })
    })

})

router.post('/playlists/exists', (req, res) => {
    let token =req.headers.authorization;
    let songId = req.body.songId;
    if(token && token.startsWith('Bearer ')){
        token = token.split(' ')[1];
    }

    let existsPlaylists = [];
    let notExistsPlaylists = [];

    const query = `
        SELECT playlists.playlistId, playlists.name, playlists.image, playlists.description, (temp.songId = ${songId}) AS hasSong
        FROM ((tokens
            INNER JOIN playlists ON tokens.userId = playlists.userId)
            LEFT JOIN (SELECT * FROM playlists_songs WHERE songId = ${songId}) as temp ON playlists.playlistId = temp.playlistId)
        WHERE token = '${token}';
    `

    database.query(query)
        .then((result) => {
            res.status(200).send({playlists : result});
        }).catch((err) => {
            res.status(500).send({
                err 
            })
        })

})

router.post('/playlists/addsong/', async (req, res) => {
    const reqData = req.body;
    let songAlreadyAdded;

    const checkSongAlreadyAdded = `
        SELECT * 
        FROM playlists_songs
        WHERE playlistId = ${reqData.playlistId} AND songId = ${reqData.songId};
    `

    await database.query(checkSongAlreadyAdded)
        .then((result) => {
            songAlreadyAdded = result.length > 0;
        }).catch((err) => {
            console.log(err);
        })

    if(songAlreadyAdded != reqData.isAddSong){
        if(songAlreadyAdded){
            const removeSong = `
                DELETE FROM playlists_songs
                WHERE playlistId = ${reqData.playlistId} AND songId = ${reqData.songId};
            `
            database.query(removeSong)
                .then((result) => res.status(200).send({hasSong : false}))
                .catch((err) => res.status(500).send({ err }))

        }else{
            const addSong = `
                INSERT INTO playlists_songs
                    (playlistId, songId)
                VALUES (${reqData.playlistId}, ${reqData.songId});
            `

            database.query(addSong)
                .then((result) => res.status(200).send({hasSong : true}))
                .catch((err) => res.status(500).send({ err }))
        }
    } else {
        res.status(500).send({
            err : 'server not ready'
        })
    }

})


module.exports = router;