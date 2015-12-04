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
	scrollBar: $('.scrollbar'),
	dragHandle: 1,
	clickBar: 1,
	speed: 300,
};
var $frame = new Sly('.frame', options).init();

var elements = [];

// Listen for tweets from the server.
socket.on('tweets', function(tweet) {
	var tweetID = tweet.id_str;
	console.log("received tweet with id: " + tweetID);

	// Append a new tweet to the container.
	$frame.add('<div class="item">' + '<div id=' + tweetID + '></div></div>', 0);

	// Replace temporary element with an embedded tweet.
	twttr.widgets.createTweet(tweetID, $("#" + tweetID)[0], {});

	// Slide new tweet in from the left.
	var element = $('#' + tweetID);
	element
		.css({ opacity: '0', left: -element.width() })
		.animate({ opacity: '1', left: 0 }, 500, 'easeInOutCubic');

	// Slide existing tweets to the right.
	for (var i = 0; i < elements.length; i++) {
		elements[i]
			.css({ left: -elements[i].width() })
			.animate({ left: 0 }, 500, 'easeInOutCubic');
	}

	elements.unshift(element);

	// Only keep 20 items around to avoid lag.
	var maxElements = 20;
	if (elements.length > maxElements) {
		$frame.remove(maxElements - 1);
		elements.pop();
	}
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
	if (form.inputbox.value != ""){
		var filter = form.inputbox.value;
		socket.emit('filter', filter);
	}
	else{
		alert("Error: Please set a Filter Value");
	}
}

//Sending Start button signal
function sendStart(form) {
	var streamType = null;
	//Start a Location Based Stream
	if(form.streamtypebox.checked == false){
		streamType = "Location Based";
		socket.emit('start', streamType);
	}
	//Start a Keyword Based Stream
	else{
		if(form.inputbox.value != ""){
			streamType = "Keyword Based";
			socket.emit('start', streamType);

		}
		else{
			alert("Error: Please set a Filter Value");
		}
	}
}
