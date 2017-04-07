const path = require('path');
const webpack = require('webpack');

module.exports = {
	context: __dirname,
	devtool: 'source-map',
	resolve: {
		modules: [
			path.resolve(__dirname, 'src'),
			'node_modules'
		],
		extensions: ['.js']
	},
	entry: {
	  autonym: './src',
    'autonym.min': './src'
  },
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
    filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
			sourceMap: true,
      minimize: true
		})
	]
};
