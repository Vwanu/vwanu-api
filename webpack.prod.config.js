/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/bin/index.ts',
  resolve: {
    extensions: ['.cjs', '.mjs', '.js', '.ts', '.json'],
    plugins: [new TsconfigPathsPlugin({ logLevel: 'info' })],
    alias: {
      '@config': path.resolve(__dirname, 'config'),
      '@root': path.resolve(__dirname, 'src'),
      '@entity': path.resolve(__dirname, 'src/entity'),
      '@schema': path.resolve(__dirname, 'src/schema'),
      '@testing': path.resolve(__dirname, 'src/testing'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@middleware': path.resolve(__dirname, 'src/middleware'),
      '@service': path.resolve(__dirname, 'src/services'),
    },
  },
  devtool: 'source-map',
  target: 'node16',
  externals: [nodeExternals()],
  optimization: {
    minimize: false, // Keep false for TypeORM compatibility
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
        },
      },
    },
  },
  output: {
    path: path.resolve(__dirname, '.build'),
    filename: 'index.js',
    chunkFilename: '[name].[chunkhash].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [
          path.resolve(__dirname, '.webpack'),
          path.resolve(__dirname, '.serverless'),
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'test'),
          /\.test\.ts$/,
          /\.spec\.ts$/,
        ],
        options: {
          transpileOnly: true, // Use transpileOnly for faster builds
          experimentalFileCaching: true,
          configFile: 'tsconfig.production.json',
        },
      },
      {
        test: /\.json$/,
        type: 'json',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: 'tsconfig.production.json',
        configOverwrite: {
          exclude: ['test/**/*', '**/*.test.ts', '**/*.spec.ts'],
        },
      },
    }),
    // Copy config files to build directory
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'config',
          to: 'config',
          globOptions: {
            ignore: ['**/*.example.*', '**/remote. example.json'],
          },
        },
        // Copy necessary files for production
        {
          from: '.sequelizerc',
          to: '.sequelizerc',
        },
        {
          from: 'migrations',
          to: 'migrations',
        },
        {
          from: 'src/seed',
          to: 'seed',
        },
      ],
    }),
    sentryWebpackPlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: process.env.SENTRY_RELEASE,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      debug: false,
      disable: false,
    }),
  ],
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  },
};
