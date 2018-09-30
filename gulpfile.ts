import * as gulp from 'gulp';

import { clean } from './tools/clean';
import { packageInit } from './tools/package-init';
import { unlinkAll } from './tools/unlink-all'; 

async function cleanAll() {
  const folders = [ 'dist', '.tmp', 'node_modules/@ngx-devtools' ];
  const packages = [ 'common', 'build', 'server', 'task' ];
  return Promise.all([
    Promise.all(packages.map(folder => {
      return Promise.all([ clean(`packages/${folder}/.tmp`), clean(`packages/${folder}/dist`) ])
    })),
    Promise.all(folders.map(folder => clean(folder)))
  ])
}

gulp.task('clean.all', () => cleanAll());

gulp.task('build', () => {
  const { build } = require('./tools/build');
  return build();
})

gulp.task('unlink.all', () => unlinkAll())

gulp.task('package.init', () => {
  return cleanAll().then(() => {
    return packageInit();
  })
})