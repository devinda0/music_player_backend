const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:id',async (req, res) => {
    const imgUrl = 'https://drive.google.com/uc?id=' + req.params.id;
    console.log(`requested image URL - ${imgUrl}`);

    try{
    const response = await axios.get(imgUrl ,{responseType:'stream'});
    response.data.pipe(res);
    } catch (e){
        console.log(`cannot get the image ${imgUrl}`);
        res.send('cannot get the image');
    }
})

module.exports = router;