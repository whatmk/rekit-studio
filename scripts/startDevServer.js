// const http = require('http');
// const express = require('express');
const fs = require('fs');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const chalk = require('chalk');
const {
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
// const openBrowser = require('react-dev-utils/openBrowser');
// const configStudio = require('../src/server/configStudio');
const configStudio = require('../lib/configStudio');
const paths = require('../config/paths');
const createDevServerConfig = require('../config/webpackDevServer.config');
const buildDll = require('./buildDll');

const useYarn = fs.existsSync(paths.yarnLockFile);
const HOST = process.env.HOST || '0.0.0.0';
const isInteractive = process.stdout.isTTY;

function _startDevServer(port) {
  const devConfig = require('../config/webpack.config.dev');
  const dllManifestPath = paths.resolveApp('.tmp/dev-vendors-manifest.json');
  delete require.cache[dllManifestPath];

  devConfig.plugins.push(
    new webpack.DllReferencePlugin({
      context: paths.appSrc,
      manifest: require(dllManifestPath),
    }),
    // new AddAssetHtmlPlugin({ filepath: paths.resolveApp('.tmp/dev-dll.js') })
    new AddAssetHtmlPlugin([
      { filepath: paths.resolveApp('.tmp/dev-dll.js') },
      // { filepath: paths.resolveApp('public/rekit-plugins.js') },
    ])
  );
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const appName = require(paths.appPackageJson).name;
  const urls = prepareUrls(protocol, HOST, port);
  // Create a webpack compiler that is configured with custom messages.
  const compiler = createCompiler(webpack, devConfig, appName, urls, useYarn);
  compiler.plugin('done', stats => {
    console.log(chalk.bold(`To use Rekit Studio, access: http://localhost:${port}`));
    console.log();
  });
  // Load proxy config
  const proxySetting = require(paths.appPackageJson).proxy;
  const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
  // Serve webpack assets generated by the compiler over a web sever.
  const serverConfig = createDevServerConfig(proxyConfig, urls.lanUrlForConfig);
  const devServer = new WebpackDevServer(compiler, serverConfig);

  configStudio(devServer.listeningApp, devServer.app);

  // devServer.use(express.static(rekit.core.paths.getProjectRoot()));
  // Launch WebpackDevServer.
  devServer.listen(port, HOST, err => {
    if (err) {
      return console.log(err);
    }
    if (isInteractive) {
      // clearConsole();
    }
    console.log(chalk.cyan('Starting the development server...\n'));
    // openBrowser(urls.localUrlForBrowser);
  });

  ['SIGINT', 'SIGTERM'].forEach(function(sig) {
    process.on(sig, function() {
      devServer.close();
      process.exit();
    });
  });
}

function startDevServer(port) {
  buildDll().then(() => _startDevServer(port));
}

module.exports = startDevServer;
