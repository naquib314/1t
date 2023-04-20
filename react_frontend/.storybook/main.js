const path = require("path");
const custom = require("../webpack.dev.js");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const jsonImporter = require("node-sass-json-importer");

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
    "../shared/**/*.stories.mdx",
    "../shared/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: (config) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    custom.resolve.extensions.forEach((e) => {
      if (!config.resolve.extensions.includes(e)) {
        config.resolve.extensions.push(e);
      }
    });

    // Copied from webpack.config.js. Storybook has its own rules for TypeScript, and
    // the other rules look like they aren't needed to get Storybook to run, so we're
    // just added the sass one. Punting the TypeScript stuff for another time.
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            modules: true,
            localIdentName: "[path][name]__[local]",
          },
        },
        {
          loader: "sass-loader",
          options: {
            webpackImporter: false,
            sassOptions: { importer: jsonImporter() },
          },
        },
      ],
      include: path.resolve(__dirname, "../"),
    });

    // Return the altered config
    return config;
  },
};
