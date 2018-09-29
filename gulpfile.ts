import * as gulp from 'gulp';

import { clean } from './tools/clean';
import { packageInit } from './tools/package-init';
import { build } from './tools/build';

import { join, resolve } from 'path';
import { existsSync, statSync, unlink, readlinkSync } from 'fs';
import { promisify } from 'util';

const exec =  require('child_process').exec;

const unlinkAsync = promisify(unlink);

async function cleanAll() {
  const folders = [ 'dist', '.tmp', 'node_modules/@ngx-devtools' ];
  return Promise.all(folders.map(folder => clean(folder)));
}

gulp.task('clean.all', () => cleanAll());

gulp.task('build', () => build());

gulp.task('unlink.all', () => {
  const packages = [ 'common', 'build', 'server', 'task' ];
  return Promise.all(packages.map(async folder => {
    const dest = join('packages', folder, 'node_modules');
    await Promise.all([ clean(`packages/${folder}/dist`), clean(`packages/${folder}/.tmp`) ])
    return (existsSync(dest) && statSync(dest).isDirectory())
      ? readlinkSync(dest) === join(resolve(), 'node_modules') ? unlinkAsync(dest): clean(dest)
      : Promise.resolve()
  }))
  .then(() => exec(`git submodule update`))
})

gulp.task('package.init', async () => {
  await cleanAll();
  await packageInit();
});