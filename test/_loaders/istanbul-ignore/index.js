module.exports = function(content) {
  var header = '/* istanbul ignore next */' + '\n' + '(function() {';
  return header + '\n' + content + '\n' + '}());';
};