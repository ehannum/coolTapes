var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var ffmpeg = require('fluent-ffmpeg');
var ffmpegStatic = require('ffmpeg-static');
var fileupload = require('express-fileupload');
var fs = require('fs');

// // firebase initialization
// var firebase = require('firebase');
// var fKey = process.env.FIREBASE_KEY || null;
// var db = null;

// // -- FIREBASE DATABASE SETUP

// if (fKey) {
//   firebase.initializeApp({
//     serviceAccount: JSON.parse(fKey),
//     databaseURL: 'https://cool-tapes.firebaseio.com/'
//   });

//   db = firebase.database();
//   console.log('Connected and authenticated to Firebase.');
// } else {
//   console.log('Firebase authentication failure: No Private Key found.');
// }

// -- SERVE STATIC FILES and JSON

app.use(express.static('public'));
app.use(fileupload());

// -- FFMPEG

app.post('/jam', function (req, res) {

  var timestamp = (new Date()).getTime();

  // TODO: writeFile instead of writeFileSync
  fs.writeFileSync('./tmp/' + timestamp + '.gif', req.files.gif.data);
  fs.writeFileSync('./tmp/' + timestamp + '.mp3', req.files.mp3.data);

  // ffmpeg -ignore_loop 0 -i animation.gif -i audio.mp3 -shortest -c:v libvpx -threads 4 -b:v 1000k -f webm out.webm

  // TODO: move this to some cloud storage
  var webmWriteStream = fs.createWriteStream('./public/tmp/' + timestamp + '.webm');

  var vid = ffmpeg('./tmp/' + timestamp + '.gif')
    .setFfmpegPath(ffmpegStatic.path)
    .inputOptions('-ignore_loop 0')
    .inputOptions('-threads 16')
    .addInput('./tmp/' + timestamp + '.mp3')
    .outputOptions('-shortest')
    .outputFormat('webm')
    .videoBitrate('1000k')
    .on('start', function (command) {
      console.log('Starting ' + command);
    })
    .on('progress', function (progress) {
      res.write(progress.timemark);
      if (progress.timemark) console.log(progress.timemark);
    })
    .on('end', function () {
      console.log('Finished Processing!');
      res.write('XX<video src="./tmp/' + timestamp + '.webm" type="video/webm" controls></video>');
      res.end();
    })
    .on('error', function (err) {
      console.log(err.message);
      res.send(err.message);
    })
    .pipe(webmWriteStream, {end: true});
});

// -- START SERVER

var port = process.env.PORT || 3030;
console.log('Listening on port', port);
server.listen(port);
