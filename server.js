// server.js

// Set up the Twitter library.
var Twit = require('twit')
function createTwitClient() {
  return new Twit({
    consumer_key: 'Z2LyQpbFs0OzmFRQHPJmmzhoS',
    consumer_secret: '5T5Ep2yQHjf0XiGDUgSRJC38iliTdJg7teutnu50S4Z4e4nMEm',
    access_token: '3837516989-IgSf9kbiEa2Df9EhD0Rut7sPh0QVh5cOJHsMk2j',
    access_token_secret: 'rk40a0TCd7mGcy5HvOqj5gn15VwqgMJpX9S51kgg3iUn3'
  });
}

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
io.on('connection', function(client) {
  console.log("* client " + client.id + " connected");

  var streams = [];
  var twitter = createTwitClient();

  // Listen for disconnects.
  client.on('disconnect', function() {
    console.log("* client " + client.id + " disconnected");

    // Stop all streams.
    streams.forEach(function (stream) {
      stream.stop();
    });
  });

  // Aggregate function for location and keyword streams.
  var handleTweet = function(tweet) {
    console.log("* client " + client.id + " was sent tweet: " + tweet.id);

    // TODO: filter keywords.
    var match = tweet.text.search('.');

    // Send the tweet to the client.
    if(match != -1){
      client.emit('tweets', tweet);
    }
  };

  // Listen for location notifications sent from the client.
  client.on('location', function(data) {
    console.log("* client " + client.id + " sent location: " + JSON.stringify(data));
    // Set up a new stream to feed to the client.
    // TODO: use location
    //Example Below: (Dummy values)
    var client_location = [data.longitude - 1, data.latitude, data.longitude, data.latitude + 1];
    //var stream = twitter.stream('statuses/filter', {locations: sanFrancisco});
    
    var stream = twitter.stream('statuses/filter', { locations: client_location});
    //var stream = twitter.stream('statuses/filter', { track: 'mango'});
    streams.push(stream);

    stream.on('tweet', function (tweet) {
      handleTweet(tweet);
    });
  });
});
