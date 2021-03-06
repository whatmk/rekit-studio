// Publish rekit-studio-dev
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

const prjRoot = path.join(__dirname, '..');
const tmpDir = path.join(prjRoot, '.tmp/prod-pkg');
const pkgJson = require(path.join(prjRoot, 'package.json'));

fs.emptyDirSync(tmpDir);
fs.ensureDirSync(tmpDir);

Object.assign(pkgJson.dependencies, pkgJson.devDependencies);
delete pkgJson.devDependencies;
delete pkgJson.files;
delete pkgJson.scripts;
delete pkgJson.nyc;

fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgJson, null, '  '));

['src', 'build', 'lib', 'bin', 'LICENSE'].forEach(file => {
  fs.copySync(path.join(prjRoot, file), path.join(tmpDir, file));
});

// Publish to npm
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const isBeta = pkgJson.version.indexOf('beta') >= 0;
const args = ['publish'];
if (isBeta) {
  args.push('--tag', 'next');
}
console.log('publish: ', args);
spawn(npmCmd, args, {
  cwd: tmpDir,
});
