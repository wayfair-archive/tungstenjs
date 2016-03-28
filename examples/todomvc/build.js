module.exports = {
  name: 'TodoMVC',
  config: require('./webpack.config.js'),
  files: [
    './index.html',
    './js/app.min.js',
    './node_modules/todomvc-app-css'
  ]
};
