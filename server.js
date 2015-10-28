// server.js

// Set up express for serving the client.
var express = require('express');
var app = express();

// Specify the directory for static files.
app.use(express.static(__dirname + '/client'));

// Serve the index to clients.
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Set up the http server for sockets.
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Listen for connections on the default port.
http.listen(process.env.PORT, function() {
  console.log('listening on *:' + process.env.PORT);
});

// Listen for connections.
io.on('connection', function(socket) {
  console.log('connected');
});






// Set up the Twitter library.
var Twit = require('twit')
var T = new Twit({
  consumer_key: 'Z2LyQpbFs0OzmFRQHPJmmzhoS',
  consumer_secret: '5T5Ep2yQHjf0XiGDUgSRJC38iliTdJg7teutnu50S4Z4e4nMEm',
  access_token: '3837516989-IgSf9kbiEa2Df9EhD0Rut7sPh0QVh5cOJHsMk2j',
  access_token_secret: 'rk40a0TCd7mGcy5HvOqj5gn15VwqgMJpX9S51kgg3iUn3'
})

// var stream = T.stream('statuses/filter', { track: 'bits' })

// stream.on('tweet', function (tweet) {
//   //console.log(tweet)
// })