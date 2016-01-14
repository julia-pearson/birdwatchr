var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var geocoder = require('geocoder');

// Configuration
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
// this path should match our seeds file
var mongoUrl = "mongodb://localhost:27017/birds";
var db;

MongoClient.connect(mongoUrl, function(err, database){
 if (err) {
   console.log(err);
 }
 console.log("connected!");
 db = database;
 process.on('exit', db.close);
});

// Routes
app.get('/', function(req, res){
  db.collection('sightings').find({}).toArray(function(error, data){
    if(data.length > 3){
      data = data.splice(data.length-3, 3);
    };
    data.forEach(function(sighting){
      var cityState = sighting.location.city + ', ' + sighting.location.state;
      var latLong = [];
      geocoder.geocode(cityState, function ( err, data) {
        // sighting.location.lat = data.results[0].geometry.location.lat;
        // sighting.location.lng = data.results[0].geometry.location.lng;
        var thisLatLong = [];
        thisLatLong.push(data.results[0].geometry.location.lat);
        thisLatLong.push(data.results[0].geometry.location.lng);
        // console.log(data.results[0].geometry.location.lat);
        // console.log(data.results[0].geometry.location.lng);
      });
    })
    res.render('index', {sightings: data});
  })
});

app.get('/sightings/new', function(req, res){
  res.render('form');
});

app.get('/api/sightings', function(req, res){
  db.collection('sightings').find({}).toArray(function(error, data){
    res.send(JSON.stringify(data));
  })
});

app.get('/demo', function(req, res){
  res.render('demo');
});

app.post('/sightings', function(req, res){
  db.collection('sightings').insert(
  { location: {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip
    },
    bird: {
      name: req.body.name,
      underbelly: req.body.underbelly,
      song: req.body.song,
      juliascared: req.body.juliascared,
      clawstrength: req.body.clawstrength
    }
  }, function(error, data){res.redirect('/')});
});

app.listen(process.env.PORT || 3000);
