var webpack = require('webpack');

module.exports = {
    entry: 'src/ractive-select',
    output: {
        path: __dirname + '/',
        filename: 'ractive-select.js',
        library: 'RactiveSelect',
        libraryTarget: 'umd',
        pathinfo: true,
    },
    resolve: {
        root: process.cwd(),
        modulesDirectories: ['node_modules', 'src'],
        extensions: ['', '.js', '.styl', '.html'],
    },
    module: {
        loaders: [
            {test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader'},
            {test: /\.html/, loader: 'ractive-loader'}
        ],
    },
}
