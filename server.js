// server.js

var text_test = "TEST";

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

    console.log("* client " + client.id + " was sent tweet: " + tweet.id);
  if(tweet.place === null || tweet.place.country_code != "MX"){
      // If a keyword filter has not been set just do location
      if(keyword === null ){
        console.log("Keyword not defined");
        client.emit('tweets', tweet);
      }
      else{
        //var match = tweet.text.search(' ' + keyword + ' ');
        var match = parse_tweet(tweet, keyword);
        // Send the tweet to the client.
        if(match == 1 || streamType == "Keyword Based"){
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

function parse_tweet(tweet, keyword_input){
  var test_keyword = keyword_input.toLowerCase();
  var parse_me = tweet.text.toLowerCase();
  var block = new Array(test_keyword.length + 1).join('b');
  var last;

  for(var i = 0; i < parse_me.length - test_keyword.length + 1; i++){
    for(var k = 0; k < test_keyword.length; k++){
      block = replaceAt(k, parse_me[i+k], block);
    }
    if(block == test_keyword){
      console.log("word found");
      if( i == 0){
        console.log("word first");
        return 1;
      } 
      else if(i > 1 && parse_me[i-1] == " ")
      {
        console.log("word found after first");
        if( last = isLast(block, parse_me) || parse_me[i + test_keyword.length] == " " || parse_me[i + test_keyword.length] == "." || parse_me[i + test_keyword.length] == "?" || parse_me[i + test_keyword.length] == "!"){
          console.log("word is last or has space after");
          return 1;
        }
      }
    }
  }
  return 2;
}

function replaceAt(index, character, block){
  var pls;
  pls = block.substr(0, index) + character + block.substr(index+character.length)
  return pls;
}

function isLast(block, parse_me){
  for(var q = parse_me.length -1; q > parse_me.length - block.length; q--){
   for(var z = block.length -1; z > 0 ;z--)
    if(parse_me[q] != block[z]){
      return false;
    }
    else return true;
  }
}