var webpack = require('webpack');
var path = require('path');

module.exports = function(env) {
  var SRC_DIR = path.resolve(__dirname, 'src');
  var BUILD_DIR = path.resolve(__dirname, 'dist');

  const baseConfig =  {
    entry: ['babel-polyfill', './src/gigz.js'],
    module : {
      rules : [
        {
          test : /\.js?/,
          loader : 'babel-loader'
        },
        {
          test: /\.html$/,
          loader: "raw-loader"
        }
      ]
    },
    resolve: {
      modules: [SRC_DIR, "node_modules"],
      extensions: ['.js']
    }
  };

  return [
    {
      ...baseConfig,
      output: {
        path: BUILD_DIR,
        filename: 'gigz.js',
        library: 'gigz',
        libraryTarget: 'commonjs2'
      },
      optimization: {
        minimize: false
      }
    },
    {
      ...baseConfig,
      output: {
        path: BUILD_DIR,
        filename: 'gigz.min.js',
        library: 'gigz',
        libraryTarget: 'commonjs2'
      },
      optimization: {
        minimize: true
      }
    },
    {
      ...baseConfig,
      output: {
        path: BUILD_DIR,
        filename: 'gigz.umd.js',
        library: 'gigz',
        libraryTarget: 'umd',
      },
      optimization: {
        minimize: false
      }
    },
    {
      ...baseConfig,
      output: {
        path: BUILD_DIR,
        filename: 'gigz.umd.min.js',
        library: 'gigz',
        libraryTarget: 'umd',
      },
      optimization: {
        minimize: true
      }
    }
  ];
}
