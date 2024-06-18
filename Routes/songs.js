const express = require('express');

const router = express.Router();
const database = require('../DBConnection/DBConnection');


router.get('/', (req, res) =>{
    database.getSongs()
        .then((result) => res.send(result))
        .catch((err) => console.log(err));
});

router.get('/:id', (req, res) =>{
    database.getSong(req.params.id)
        .then((result) => res.send(result[0]))
        .catch((err) => console.log(err));
});

router.get('/authors/:id', (req, res) => {
    console.log('author requested');
    database.getAuthors(req.params.id)
        .then((result) => res.send(result))
        .catch((err) => console.log(err));
})

module.exports = router;