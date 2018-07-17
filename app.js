require("dotenv").config();
const express = require("express");
const stream = require("youtube-audio-stream");
const apiRequest = require("./public/js/apiRequest");
const moment = require("moment");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // eslint-disable-line
app.locals.moment = moment;

// INDEX PAGE
app.get("/", function (req, res) {
	res.render("index");
});

// SOURCE URL FOR AUDIO
app.get("/api/play/:videoId", function (req, res) {
	// Secure this route to prevent unauthorized access and/or convert to a post route
	// Find a better name for this route
	let requestUrl = "http://youtube.com/watch?v=" + req.params.videoId;
	try {
		stream(requestUrl).pipe(res);
	} catch (exception) {
		res.status(500).send(exception);
	}
});

// API RESPONSE ROUTE
app.get("/api/request/", function (req, res) {
	let query = req.query.apiQuery;
	let videoId = videoIdParser(query);
	let playlistId = playlistIdParser(query);
	if (videoId.length == 11) {
		apiRequest.buildVideo(videoId).then(function (result) {
			// result.duration = moment.utc(result.duration * 1000).format("mm:ss");
			res.type("json");
			res.write(JSON.stringify(result));
			res.end();
		}).catch(function (err) {
			if (err) {
				invalidId(res);
			}
		});
	} else {
		apiRequest.buildPlaylist(playlistId).then(function (result) {
			res.type("json");
			res.write(JSON.stringify(result));
			res.end();
		}).catch(function (err) {
			if (err) {
				invalidId(res);
			}
		});
	}
});

// Plyr player
app.get("/player/:videoId", function (req, res) {
	// This route should only play streams from this domain
	apiRequest.buildVideo(req.params.videoId).then(function (result) {
		let src = result.src;
		let duration = result.duration;
		let title = result.title;
		res.render("player", { src: src, duration: duration, title: title });
	}).catch(function (err) {
		if (err) {
			invalidId(res);
		}
	});
});

// Playlist Route
app.get("/playlist/:playlistId", function (req, res) {
	apiRequest.buildPlaylist(req.params.playlistId).then(function (playlistItems) {
		res.render("playlist", { playlistItems: playlistItems });
	}).catch(function (err) {
		if (err) {
			invalidId(res);
		}
	});
});

// Search Route
app.get("/results/", function (req, res) {
	apiRequest.buildSearch(req.query.searchQuery).then(function (searchResults) {
		res.render("search", { searchResults: searchResults });
	}).catch(function (err) {
		if(err){
			invalidId(res);
		}
	});
});

// Redirection route to get to player or playlist player from index page, this was done to make the url cleaner
app.get("/redirection/", function (req, res) {
	if (req.query.videoQuery) {
		let videoId = videoIdParser(req.query.videoQuery);
		res.redirect("/player/" + videoId);
	} else if (req.query.playlistQuery) {
		let playlistId = playlistIdParser(req.query.playlistQuery);
		res.redirect("/playlist/" + playlistId);
	}
});

// Route for pages that don't exist
app.get("*", function (req, res) {
	res.render("404");
});

// Listen on port 3000
app.listen(3000, function () {
	console.log("Server has started on port 3000");
});

function videoIdParser(query) {
	let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/; // eslint-disable-line
	let match = query.match(regExp);
	if (match && match[7].length == 11) {
		return match[7];
	}
	// in this case an id was entered, this is really lazy, find a way to validate it
	return query;
}

function playlistIdParser(query) {
	let reg = new RegExp("[&?]list=([a-z0-9_]+)", "i");
	let match = query.match(reg);
	// it found the id
	if (match && match.length === 2) {
		return (match[1]);
	}
	// in this case an id was entered, this is really lazy, find a way to validate it
	return query;
}

// If the youtube api returns an error, it redirects user to this page
function invalidId(res) {
	res.render("invalid");
}