//main.js

// Connect to the server via socket.js.
var socket = io();

// Listen for tweets from the server.
socket.on('tweets', function(data) {
	alert(JSON.stringify(data));

	// TODO: do something with the tweet.
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
