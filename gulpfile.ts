import * as gulp from 'gulp';

import { cleanAll } from './tools/clean';
import { packageInit } from './tools/package-init';
import { unlinkAll } from './tools/unlink-all'; 
import { build } from './tools/build';

gulp.task('package.init', () => cleanAll().then(() => packageInit()))

gulp.task('build', () => build())

gulp.task('clean.all', () => cleanAll())

gulp.task('unlink.all', () => unlinkAll())
