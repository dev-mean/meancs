var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        main: './src/admin/js/client.js'
    },
    output: {
        path: path.resolve("server/admin/js"),
        filename: 'client.js'
    },
    module: {
        loaders: [{loader: 'babel-loader'}]
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
