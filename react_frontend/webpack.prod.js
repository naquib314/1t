const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
  // This sets process.env.NODE_ENV to "production" and minifies the output
  // bundles.
  mode: "production",
  //  A full SourceMap is emitted as a separate file.
  devtool: "source-map",
  output: {
    filename: "[name].[contenthash].js",
  },
  plugins: [new WebpackManifestPlugin(), new CleanWebpackPlugin()],
});
