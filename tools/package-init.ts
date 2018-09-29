import { symlink } from 'fs';
import { join, resolve } from 'path';
import { promisify } from 'util';

import { symlinkPackages } from './link-packages';

const gitAsync = require('simple-git/promise');
const exec =  require('child_process').exec;

const symlinkAsync = promisify(symlink);

const packages = [ 'common', 'build', 'server', 'task' ];
const nodeModules = join(resolve(), 'node_modules');

const argv = require('yargs')
  .option('branch', { default: null, type: 'string' })
  .argv;

async function packageInit() {
  return Promise.all(packages.map(folder => {
    const pkgFolder = `packages/${folder}`;
    const pkg = gitAsync(`./${pkgFolder}`);
    return pkg.checkout('master')
      .then(() => exec(`cd ${pkgFolder}`))
      .then(() => exec(`git pull origin master`))
      .then(() => pkg.checkout(argv.branch))
      .then(() => symlinkPackages(pkgFolder, join(nodeModules, '@ngx-devtools', folder)))
      .then(() => symlinkAsync(nodeModules, join(pkgFolder, 'node_modules'), 'dir'))
  }))
}

export { packageInit }