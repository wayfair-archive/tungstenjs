(function() {
  var data = {
    'inputs': [],
    'textareas': [],
    'checkboxes': []
  };

  for (var i = 0; i < 5; i++) {
    var istr = '' + i;
    var item = {
      name: istr,
      value: istr
    };
    data.inputs.push(item);
    data.textareas.push(item);
    data.checkboxes.push(item);
  }

  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());
