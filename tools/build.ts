import { createRollupConfig, ngxBuild  } from '../packages/common/src/build-package';
import { clean } from './clean';

import { globFiles, copyFileAsync } from '../packages/common/src/file';
import { extname, join, resolve, sep } from 'path';
import { mkdirp } from './mkdirp';

const packages = [ 'common', 'build', 'server', 'task' ];

async function copyFiles(files) {
  return Promise.all(files.map(file => {
    const destPath = file.replace('src', '.tmp');
    return copyFileAsync(file, destPath);
  }))
}

async function build() {
  await Promise.all(packages.map(folder => {
    return Promise.all([ 
      clean(`packages/${folder}/dist`), 
      clean(`packages/${folder}/.tmp`) 
    ])
  }))

  // const filter = file => extname(file) === '.ts';
  // const map = file => `export * from '${file.replace(join(resolve(), sep, 'src', sep), './').replace('.ts', '')}';`;
  // const sourceFiles = files.filter(filter).map(map).join('\n');
    
  for (const folder of packages) {
    const files = await globFiles(`packages/${folder}/src/**/*.*`);

    const tmpFolder = join(resolve(), 'packages', folder, '.tmp');
    await mkdirp(tmpFolder);

    await copyFiles(files);
  }

}

export {  build }