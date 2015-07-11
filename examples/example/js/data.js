(function() {
  var data = {
    'name': 'example app'
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());