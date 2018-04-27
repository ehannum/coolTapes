$(document).ready(function () {
  $('.upload-form').submit(function (e) {
    e.preventDefault();
    $('.upload-form').hide();

    var xhr = new XMLHttpRequest()
    xhr.open("POST", "/jam", true);
    xhr.onprogress = function () {
      var timestamp = xhr.responseText.split(':');
      timestamp = timestamp[timestamp.length-1];
      if (isNaN(Math.round(timestamp))) {
        $('.output').html('<h2 class="text-center">' + timestamp.split('XX')[1] + '</h2>');
      } else {
        $('.output').html('<h2 class="text-center">Processed ' + Math.round(timestamp) + ' secs...</h2>');
      }
    }
    xhr.send(new FormData($('.upload-form')[0]));

    $('.output').html('<h2 class="text-center">Processing...</h2>');
  });
});
