var _process;

try {
  _process = eval('process');  // avoid browserify shim
} catch (e) {}

module.exports = typeof _process === 'object' && _process.toString() === '[object process]';
