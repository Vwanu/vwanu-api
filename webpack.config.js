/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const slsw = require('serverless-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const entry =
    Object.keys(slsw.lib.entries).length > 1
        ? slsw.lib.entries
        : './src/bin/index.ts';
const mode = slsw.lib.webpack.isLocal
    ? 'development'
    : process.env.NODE_ENV === 'development'
        ? 'development'
        : 'production';

module.exports = {
    mode,
    entry,
    resolve: {
        extensions: ['.cjs', '.mjs', '.js', '.ts'],
        plugins: [new TsconfigPathsPlugin({ logLevel: 'debug' })],
    },
    devtool: 'source-map',
    target: 'node16',
    externals: [nodeExternals()],
    // Minimization messes with TypeORMs inferance of field names
    optimization: {
        minimize: false,
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
                    path.resolve(__dirname, 'test'),       // Exclude test directory
                    /\.test\.ts$/,                         // Exclude test files
                    /\.spec\.ts$/                          // Exclude spec files
                ],
                // And here we have options for ts-loader
                // https://www.npmjs.com/package/ts-loader#options
                options: {
                    transpileOnly: true,
                    // Enable file caching, can be quite useful when running offline
                    experimentalFileCaching: true,
                },
            },
        ],
    },
    watch: mode === 'development',
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: 'tsconfig.json',
                // Exclude test files from type checking
                configOverwrite: {
                    exclude: ['test/**/*', '**/*.test.ts', '**/*.spec.ts']
                }
            }
        }),
        sentryWebpackPlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            release: process.env.SENTRY_RELEASE,

            // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
            authToken: process.env.SENTRY_AUTH_TOKEN,
            debug: mode === 'development',
            disable: mode === 'production',
        }),
    ],
};
