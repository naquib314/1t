const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const jsonImporter = require("node-sass-json-importer");

module.exports = {
  entry: {
    DepMap: "./src/index.tsx",
    cellLine: "./src/apps/cellLine.tsx",
    celligner: "./src/apps/celligner.tsx",
    interactive: "./src/apps/interactive.tsx",
    interactivev2: "./src/apps/interactivev2.tsx",
    datasetManager: "./src/apps/datasetManager.tsx",
    groupsManager: "./src/apps/groupsManager.tsx",
    download: "./src/apps/download.tsx",
    privateDatasets: "./src/apps/privateDatasets.tsx",
    tdaSummary: "./src/apps/tdaSummary.tsx",
    genePage: "./src/apps/genePage.tsx",
    compoundDashboard: "./src/apps/compoundDashboard.tsx",
    tableTester: "./src/apps/tableTester.tsx",
    dataExplorer2: "./src/apps/dataExplorer2.tsx",
    interactiveTable: "./src/apps/interactiveTable.tsx",
    lineup: "./src/apps/lineup.tsx",
  },
  output: {
    path: path.resolve(__dirname, "..", "depmap", "static", "webpack"),
    library: "[name]",
    // This is set in ./src/public-path.ts at runtime because we don't actually
    // know it at build time.
    // See https://webpack.js.org/guides/public-path/#on-the-fly
    publicPath: undefined,
  },

  plugins: [new ESLintPlugin({ extensions: ["js", "ts", "tsx"], quiet: true })],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".scss", ".css"],
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              // https://webpack.js.org/loaders/css-loader/#localidentname
              // use '[hash:base64]' for production
              // use '[path][name]__[local]' for development
              localIdentName: "[hash:base64]",
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
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },

  optimization: {
    moduleIds: "hashed",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          // We split dependencies into their own chunk so they can be
          // cached by the browser. However, we don't want to do that too
          // aggressively. Some application bundles don't need all of that.
          // Also, caching the whole node_modules directory would mean that
          // introducing any new dependency invalidates that cache. This is
          // a compromise: include only libraries that are large, upgraded
          // infrequently, and commonly required.
          test: ({ resource }) =>
            [
              "d3",
              "d3-scale",
              "popper\\.js",
              "react",
              "react-base-table",
              "react-bootstrap",
              "react-dom",
              "react-motion",
              "react-overlays",
              "react-select",
              "react-table",
            ].some((module) =>
              RegExp(`[\\/]node_modules[\\/]${module}[\\/]`).test(resource)
            ),
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    // plotly.js is enormous and difficult to cache. There is a pre-compiled
    // bundle you can use (and even partial ones to reduce the size) but I
    // couldn't get any of that to work. It may be worth another try at some
    // point.
    // https://github.com/plotly/plotly-webpack#the-easy-way-recommended
    "plotly.js": "Plotly",
  },
};
