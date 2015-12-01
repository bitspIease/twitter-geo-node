//main.js

// Connect to the server via socket.js.
var socket = io();

// Configure Sly (for the scrolling items).
var options = {
	horizontal: 1,
	itemNav: 'basic',
	mouseDragging: 1,
	releaseSwing: 1,
	elasticBounds: 1,
	speed: 300,
};
var $frame = new Sly('.frame', options).init();

// Listen for tweets from the server.
socket.on('tweets', function(tweet) {
	var tweetID = tweet.id_str;
	console.log("received tweet with id: " + tweetID);

	// Append a new tweet to the container.
	$frame.add('<div class="item">' + '<div id=' + tweetID + '></div></div>', 0);

	// Replace temporary element with an embedded tweet.
	twttr.widgets.createTweet(tweetID, $("#" + tweetID)[0], {});
});

// Callback for successful geolocation.
function geolocationSuccesful(position) {
	socket.emit('location', {
		latitude: position.coords.latitude,
		longitude: position.coords.longitude
	});
}

// Callback for error in geolocation.
function geolocationError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED:
			alert("User denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			alert("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			alert("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			alert("An unknown error occurred.");
			break;
	}
}

// Attempt to acquire geolocation data.
if (navigator.geolocation) {
    var optn = {
		enableHighAccuracy : true,
		timeout : Infinity,
		maximumAge : 0
	};

	// Get the user's current position
    navigator.geolocation.getCurrentPosition(geolocationSuccesful, geolocationError, optn);
} else {
	alert('Geolocation is not supported in your browser.');
}


//Sending filter keyword to server for use
function sendFilter(form) {
	var filter = form.inputbox.value;
	socket.emit('filter', filter);
}
