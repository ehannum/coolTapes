$(document).ready(function () {
  $('.upload-form').submit(function (e) {
    e.preventDefault();
    $('.upload-form').hide();

    var xhr = new XMLHttpRequest()
    xhr.open("POST", "/jam", true);
    xhr.onprogress = function () {
      var timestamp = xhr.responseText.split(':');
      secs = timestamp[timestamp.length-1];
      if (isNaN(Math.floor(secs))) {
        $('.output').html('<h2 class="text-center">' + secs.split('XX')[1] + '</h2>');
      } else {
        var mins = timestamp[timestamp.length-2];
        if (mins == 0) {
          $('.output').html('<h2 class="text-center">Processed ' + Math.floor(secs) + ' secs...</h2>');
        } else {
          $('.output').html('<h2 class="text-center">Processed ' + Math.floor(mins) + ' mins ' + Math.round(secs) + ' secs...</h2>');
        }
      }
    }
    xhr.send(new FormData($('.upload-form')[0]));

    $('.output').html('<h2 class="text-center">Processing...</h2>');
  });
});
