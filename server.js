'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');
const session =  require("express-session");
const helmet  = require ("helmet");
const nocache = require("nocache");
const MongoClient = require("mongodb").MongoClient;
const mongo = new MongoClient(process.env.DB, {useNewUrlParser:true, useUnifiedTopology:true});



var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();


app.use('/public', express.static(process.cwd() + '/public'));
app.use(helmet());
app.use(nocache()); 
app.use(helmet.hidePoweredBy({ setTo: "PHP 4.2.0" }));


const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
 

let sitemap;
 
app.get('/sitemap.xml', function(req, res) {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  // if we have a cached entry send it
  if (sitemap) {
    res.send(sitemap)
    return
  }
 
  try {
    const smStream = new SitemapStream({ hostname: 'https://fcc-personal-library-thetradecoder.glitch.me/' })
    const pipeline = smStream.pipe(createGzip())
 
    // pipe your entries or directly write them.
    
    smStream.write({ url: '/robots.txt'})
    smStream.write({ url: '/sitemap.xml'})
    smStream.write({ url: '/'})
    smStream.end()
 
    // cache the response
    streamToPromise(pipeline).then(sm => sitemap = sm)
    // stream write the response
    pipeline.pipe(res).on('error', (e) => {throw e})
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})






app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongo.connect((err, db)=>{
if (err){
  console.log(err);
} else{  
  console.log("mongo connection successful");


//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app, db);

//Routing for API 
apiRoutes(app, db);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});
  } // mongo success condition
}); // mongo connection
module.exports = app; //for unit/functional testing
