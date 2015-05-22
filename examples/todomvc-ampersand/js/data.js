(function() {
  var data = {
    'todoItems': [{'title': 'lorem ipsum'}, {'title': 'foo'}],
    'todoCount': 2,
    'todoCountPlural': true
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());