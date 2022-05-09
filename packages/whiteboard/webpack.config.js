const webpack = require('webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV == "production";
console.log(process.env.NODE_ENV)
const config = {
  entry: {
    main:'./src/entry.js',
//    'pdf.worker': path.join(process.cwd(), 'node_moudules/pdfjs-dist/build/pdf.worker.entry'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'whiteboard_sdk.js',
    library:"whiteboard",
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  },
  mode:'production',
};
externals = {
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};;