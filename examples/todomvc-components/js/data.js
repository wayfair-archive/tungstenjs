(function() {
  var data = {
    'filter_set': {
      filters: [
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
    }
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());
