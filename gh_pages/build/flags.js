'use strict';

var program = require('commander');

program
  .version('0.0.1')
  .option('--watch', 'Watch')
  .option('--dev', 'Minify')
  .parse(process.argv);

module.exports = {
  watch: !!program.watch,
  dev: !!program.dev
};
