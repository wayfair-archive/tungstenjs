(function() {
  var data = {
    'name': 'Custom Elements'
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());
