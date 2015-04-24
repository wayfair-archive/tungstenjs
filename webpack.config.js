module.exports = {
  output: {
    libraryTarget: 'var',
    library: 'tungsten'
    //
    // -- For AMD output --
    // libraryTarget: 'amd'
    // library: 'tungsten', // For named AMD, uncomment this line
    //
    // -- For UMD output --
    // libraryTarget: 'umd',
    // library: 'tungsten'
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  }
};