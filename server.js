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
  var streamType = null;
  var client_location = null;
  var keyword = null;
  var twitter = createTwitClient();
  var lastTweetTime = new Date();

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
    // Ignore retweets.
    if (tweet.hasOwnProperty('retweeted_status')) {
      if (tweet.retweeted_status.retweet_count > 0) {
        console.log("* client " + client.id + " ignoring retweet");
        return;
      }
    }

    // Only send 1 tweet per second.
    var currentTime = new Date();
    if (((currentTime - lastTweetTime) / 1000) < 1) {
      console.log("skipping tweet, only " + ((currentTime - lastTweetTime) / 1000) + " elapsed");
      return;
    } else {
      console.log("continuing");
      lastTweetTime = currentTime;
    }

    console.log("* client " + client.id + " was sent tweet: " + tweet.id);
  if(tweet.place === null || tweet.place.country_code != "MX"){
      // If a keyword filter has not been set just do location
      if(keyword === null ){
        console.log("Keyword not defined");
        client.emit('tweets', tweet);
      }
      else{
        var match = tweet.text.search(' ' + keyword + ' ');

        // Send the tweet to the client.
        if(match != -1 || streamType == "Keyword Based"){
          client.emit('tweets', tweet);
        }
      }
    }
    else console.log("MEXICAN TWEET ALERT!!!");
  };

  //Listen for start stream button
  client.on('start', function(data){
    //Set up stream
    streamType = data;

    //Checking what type of stream to set up
    //Location Stream
    if(streamType == "Location Based"){
      console.log("Starting Location Stream");
      var stream = twitter.stream('statuses/filter', { locations: client_location});

      // Push to streams array for multiple streams.
      streams.push(stream);

      // What to do with tweets
      stream.on('tweet', function (tweet) {
        handleTweet(tweet);
      });
    }
    //Keyword Stream
    else{
        console.log("Starting Keyword Stream");

        var stream = twitter.stream('statuses/filter', { track: keyword});

        // Push to streams array for multiple streams.
        streams.push(stream);

        // What to do with tweets
        stream.on('tweet', function (tweet) {
          handleTweet(tweet);
        });
    }

  });

  // Listen for location notifications sent from the client.
  client.on('location', function(data) {
    console.log("* client " + client.id + " sent location: " + JSON.stringify(data));
    // Set up a new stream to feed to the client.

    // Set up stream based upon client location
    client_location = [data.longitude - 1, data.latitude, data.longitude, data.latitude + 1];

  });

  // Listen for filter keyword
  client.on('filter', function(data) {
    console.log("* client " + client.id + " sent filter: " + data);
    keyword = data;
  });

// End IO connection
});
