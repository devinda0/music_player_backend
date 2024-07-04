const { default: axios } = require('axios');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const songsRoute = require('./Routes/songs');
const imgRoute = require('./Routes/img');
const audioRoute = require('./Routes/audio');
const loginRoute = require('./Routes/user')

const app = express();

app.use(cors());

app.use('/api/songs/', songsRoute);
app.use('/api/img/', imgRoute);
app.use('/api/audio/', audioRoute);
app.use('/api/user/', loginRoute);

let count = 0 ;

// app.get('/api', async (req,res) => {
//     try{
//     console.log(count);
//     count++;
//     const response = await axios.get('https://drive.usercontent.google.com/download?id=1Dka4Owadz5FIFFRpaKVmXFtDZoAM3CJt&export=view&authuser=0', {responseType:'stream'});

//     response.data.pipe(res);
//     } catch (e){
//         console.log("Error occured...")
//     }
// });

// app.get('/api/song/:id', (req,res) => {
//     connection.query('SELECT * FROM songs', (err, result) => {
//         if (err) console.log("Error");
//         else res.send(result);
//     })
//     console.log(req.params.id);
// })

const port = 3005;

app.listen(port, () => {console.log(`server started on port ${port}....`)});