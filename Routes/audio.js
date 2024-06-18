const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:id', async (req, res) => {
    const audioUrl = 'https://drive.google.com/uc?id=' + req.params.id;
    
    console.log(`requested audio URL ${audioUrl}`);
    console.log(req.headers.range);
    
    try{
        const response = await axios.get(audioUrl ,{responseType:'stream'});
        response.data.pipe(res);
    } catch(e){
        console.log(`cannot load the audio ${audioUrl}`);
        res.send('cannot load the audio');
    }

})

router.get('/test/:id', async (req, res) => {
    const audioUrl = `https://drive.google.com/uc?id=${req.params.id}&export=download`;
    const range = req.headers.range;

    if (!range) {
        res.status(400).send('Requires Range header');
        return;
    }

    try {
        // Make a HEAD request to get the file size
        const headResponse = await axios.head(audioUrl);
        const fileSize = headResponse.headers['content-length'];
        
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        if (start >= fileSize) {
            res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
            return;
        }

        const chunkSize = (end - start) + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'audio/mpeg',
        };

        res.writeHead(206, headers);

        // Make a GET request with the Range header to get the specific chunk
        const streamResponse = await axios.get(audioUrl, {
            headers: {
                'Range': `bytes=${start}-${end}`,
            },
            responseType: 'stream',
        });

        streamResponse.data.pipe(res);
    } catch (e) {
        console.error(`Cannot load the audio from ${audioUrl}`, e);
        res.status(500).send('Cannot load the audio');
    }
});

module.exports = router;