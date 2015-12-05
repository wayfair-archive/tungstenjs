(function() {
  var data = {
    name: 'world',
    time: Date.now()
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());
