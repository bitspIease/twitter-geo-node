//main.js

// Connect to the server via socket.js.
var socket = io();


//Geolocation Functions
function showPosition(position) {
    document.write('Latitude: '+position.coords.latitude+'Longitude: '+position.coords.longitude);
}

function showError(error) {
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

if (navigator.geolocation) {
    var optn = {
			enableHighAccuracy : true,
			timeout : Infinity,
			maximumAge : 0
		};
	// Get the user's current position
    navigator.geolocation.getCurrentPosition(showPosition, showError, optn);
} 
else {
	alert('Geolocation is not supported in your browser');
}
//End Geolocation Functions