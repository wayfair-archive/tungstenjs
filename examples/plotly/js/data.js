(function() {
  var data = {
    name: 'world',
    myPieChart: {
      data: {
        values: [19, 21, 2],
        labels: ['foo', 'bar', 'other'],
        type: 'pie'
      }
    }
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());
