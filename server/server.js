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

  var gif = req.files.gif;
  var mp3 = req.files.mp3;

  fs.writeFileSync('./server/tmp/in.gif', gif.data);
  fs.writeFileSync('./server/tmp/in.mp3', mp3.data);

  // ffmpeg -ignore_loop 0 -i animation.gif -i audio.mp3 -shortest -c:v libvpx -threads 4 -b:v 400k -f webm out.webm

  var webmWriteStream = fs.createWriteStream('./public/out.webm');

  var vid = ffmpeg()
    .input('./server/tmp/in.gif')
    .inputOptions('-ignore_loop 0')
    .input('./server/tmp/in.mp3')
    .outputOptions('-shortest')
    .outputFormat('webm')
    .videoCodec('libvpx')
    .on('start', function (command) {
      console.log('Starting ' + command);
    })
    .on('end', function () {
      console.log('Finished Processing');
      res.send('<video><source src="out.webm" type="video/webm" controls></video>');
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
