(function() {
  var data = {
    'todoItems': [{'title': 'lorem ipsum'}, {'title': 'foo'}],
    'hasTodos': true,
    'todoCount': 2,
    'todoCountPlural': true,
    'filters': [
      {
        name: 'All',
        hash: '',
        selected: true
      },
      {
        name: 'Active',
        hash: 'active',
        selected: false
      },
      {
        name: 'Completed',
        hash: 'completed',
        selected: false
      }
    ]
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());
