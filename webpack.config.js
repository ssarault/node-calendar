var path = require('path');
var webpack = require('webpack');

var entryPathPrex = './dev/js';

module.exports = {
    entry: {
        'calendar': entryPathPrex + '/calendar.js'
    },
    output: {
        path: path.resolve(__dirname, './src/public/js'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }]
    },
    stats: {
        colors: true
    },
    //devtool: 'source-map'
};