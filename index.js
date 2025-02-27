const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Urls = require('./models/url');
const dns = require('dns');
const util = require('util');
const cron = require('node-cron');
const axios = require('axios');


// Basic Configuration
const port = 3000;
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error',(error) => console.error(error));
db.once('open',() => console.log('Connected to Database'));


cron.schedule('*/10 * * * *', () => {
     axios.get('https://url-shortener-x793.onrender.com/')
        .then(resonse => {
          console.log('Server Pinged successfully');
        })
        .catch(error => {
          console.log(error);
        });
})


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// app.post('/api/shorturl', async (req, res) => {
//   const { url } = req.body;

//   try {
    

//     // If the DNS lookup is successful, proceed with saving to the database
//     const short_url = Math.floor(Math.random() * 1000);
//     const data = { original_url: url, short_url: short_url };
//     const newUrl = new Urls(data);

//     // Save to the database
//     await newUrl.save();

//     // Send the response
//     res.json(data);
//   } catch (error) {
//     // Handle errors, send appropriate response
//     res.status(404).json({ error: 'Invalid URL' });
//     console.log(error);
//   }
// });

app.post('/api/shorturl',async (req,res) => {
  const { url } = req.body;  
  let urlRegex = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/gi);
  
  if(!url.match(urlRegex)) {
   res.json({error: 'Invalid URL'});
    
  }
  else{
      // const urlObj = new URL(url);
      const short_url = Math.floor(Math.random() * 1000);
      const data = {original_url: url, short_url: short_url}
      const newUrl = new Urls(data);
      const UrL = await newUrl.save();
      res.json(data);
    
  }      
  }) 

app.get('/api/shorturl/:short_url',async (req,res) => {
     const short_url = req.params.short_url;
    const url = await Urls.findOne({short_url: short_url});
    //  const url = Url.find({short_url: short})
   if(url == null) {
    return res.status(404).json({error: 'No short URL found for the given input'});
   }
    console.log(url.original_url);
     res.redirect(url.original_url);
    // res.send(url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
