var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var ffmpeg = require('fluent-ffmpeg');
var fileupload = require('express-fileupload');
var fs = require('fs');

// -- SERVE STATIC FILES and JSON

app.use(express.static('public'));
app.use(fileupload());

// -- FFMPEG

app.post('/jam', function (req, res) {

  var timestamp = Date.now();

  // TODO: writeFile instead of writeFileSync
  fs.writeFileSync('./tmp/' + timestamp + '.gif', req.files.gif.data);
  fs.writeFileSync('./tmp/' + timestamp + '.mp3', req.files.mp3.data);

  // ffmpeg -ignore_loop 0 -i animation.gif -i audio.mp3 -shortest -c:v libvpx -threads 4 -b:v 1000k -f webm out.webm

  // TODO: move this to some cloud storage
  var webmWriteStream = fs.createWriteStream('./public/tmp/' + timestamp + '.webm');

  var vid = ffmpeg()
    .input('./tmp/' + timestamp + '.gif')
    .inputOptions('-ignore_loop 0')
    .inputOptions('-threads 16')
    .input('./tmp/' + timestamp + '.mp3')
    .videoCodec('libvpx')
    .outputOptions('-shortest')
    .outputOptions('-g 250')
    .outputFormat('webm')
    .videoBitrate('64k')
    .on('start', function (command) {
      console.log('Starting ' + command);
    })
    .on('progress', function (progress) {
      res.write(progress.timemark);
      console.log(progress.timemark);
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
