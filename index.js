const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Urls = require('./models/url');
const dns = require('dns');

// Basic Configuration
const port = 3000;
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error',(error) => console.error(error));
db.once('open',() => console.log('Connected to Database'));


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',(req,res) => {
  const { url } = req.body;
  dns.lookup(url, (error,address,family) => {
    if(error) {
      res.status(404).json({error: 'invalid url'})
      console.log(error);
    }else {
      const short_url = Math.floor(Math.random() * 1000);
      const data = {original_url: url, short_url: short_url}
      const newUrl = new Urls(data);
      const UrL = newUrl.save();
      res.json(data);
    }
  }) 
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
