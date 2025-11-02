var path = require('path');
var childProcess = require('child_process');
var webpack = require('webpack');

// Add HMR for development environments only.
var entry = ['./src/index.js'];

function getBuildTimestamp () {
  function pad2 (value) {
    return ('0' + value).slice(-2);
  }
  var date = new Date();
  var timestamp = [
    pad2(date.getUTCDate()),
    pad2(date.getUTCMonth()+1),
    date.getUTCFullYear()
  ]
  return timestamp.join('-');
}

var commitHash = childProcess.execSync('git rev-parse HEAD').toString();

// Minification.
var plugins = [
  new webpack.DefinePlugin({
    'process.env':{
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    },
    VERSION: JSON.stringify(require('./package.json').version),
    BUILD_TIMESTAMP: JSON.stringify(getBuildTimestamp()),
    COMMIT_HASH: JSON.stringify(commitHash)
  }),
];

// dist/
var filename = 'aframe-material.js';
var outPath = 'dist';
if (process.env.NODE_ENV === 'production') {
  filename = 'aframe-material.min.js';
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devServer: {
    port: 3333,
    hot: true,
    static: {
      directory: path.join(__dirname),
      watch: true
    }
  },
  entry: entry,
  devtool : 'source-map',
  output: {
    path: path.join(__dirname, outPath),
    filename: filename,
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: plugins
};

