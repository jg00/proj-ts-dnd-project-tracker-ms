// webpack will need an absolute path to a certain folder
const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

// webpack will need a JS object
module.exports = {
  mode: "production",
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "none",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};

/*
  By default webpack is just a bundler.  It does not know what to do with .ts files.
  Any extra functionality like compiling TS to JS has to be taught to webpack.

  Loaders:
  "module" property is where we can give webpack instructions on how to handle TS files.
*/
