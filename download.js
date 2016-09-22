"use strict";
var download = require("download");
var downloadStatus = require("download-status");
var https = require("https");
var xmlParser = require("xml2js").parseString;
var mkdirp = require('mkdirp');
var sanitize = require("sanitize-filename");

function downloadVideo(source, hd){
	// Retrieve xml from treehouse
	https.get(source, function(response){
		var xml = "";

		// Put all the xml data in a variable
		response.on("data", function(chunk){
			xml += chunk;
		});

		// When that's done, filter the xml
		// And add all the links in an array
		response.on("end", function(){
			xmlParser(xml, function (err, xmlObject) {
				var couresParentName = xmlObject.rss.channel[0].title;
				var courseItem = xmlObject.rss.channel[0].item;
				var courseLinks = [];

				//I'm adding all the link
			   	courseItem.forEach(function(course){
			   		courseLinks.push(course.enclosure[0].$.url + hd + "|" + course.title[0].split(":")[0].trim() + "|" + course.title[0].split(":")[1].trim());
			    });

			   	var moduleNumbering = 0;
			   	var previousModuleFolder = "";
			   	var courseFileNameNumbering;
			   	var firstVideoOfModule = true;

			   	courseLinks.forEach(function(course){
			   		var courseVideoDetails = course.split("|");
					var courseVideoDownloadURL = courseVideoDetails[0];
					var courseModuleName = courseVideoDetails[1];
					var courseVideoName = courseVideoDetails[2];
					var courseVideoFileName = sanitize(courseVideoDetails[2]);


			   		if(courseModuleName !== previousModuleFolder){
			   			//Starting a new module
			   			moduleNumbering++;
			   			previousModuleFolder = courseModuleName;
			   			courseFileNameNumbering = 1;
			   		}

			   		//Add leading zero if numbers are from 1-9
			   		if(courseFileNameNumbering < 10){
			   			courseFileNameNumbering = "0" + courseFileNameNumbering;
			   		}

			   		//Form the name of the file with numbering so you can see the video's in the correct order
			   		//Also removing the token and options from the originel filename
			   		var courseVideoFileName = courseFileNameNumbering + ". " + courseVideoFileName + ".mp4";
			   		courseFileNameNumbering++;
			   		var directory = "downloaded/" + couresParentName + "\/" + moduleNumbering + "." + courseModuleName;

			   		//Make all the directories and download the video's in the correct directory
					mkdirp.sync(directory);
			   		new download({mode: "755"}).get(courseVideoDownloadURL).rename(courseVideoFileName).dest(directory).use(downloadStatus()).run();
			   	});		   	
			});
		});
	});
}

module.exports.downloadVideo = downloadVideo;