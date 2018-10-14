import { join, resolve, basename } from 'path';
import { existsSync, copyFile } from 'fs';
import { promisify } from 'util';

import { clean } from './clean';
import { mkdirp } from './mkdirp';

const packages = [ 'common', 'build', 'server', 'task' ];

const copyFileAsync = promisify(copyFile);

async function onBuildAfterHook() {
  const buildAfterPath = join(process.env.APP_ROOT_PATH, 'build-after.js');
  if (existsSync(buildAfterPath)) {
    await import(buildAfterPath).then(({ onAfterBuild }) => onAfterBuild())
  } 
}

async function onBuildBeforeHook() {
  const builBeforePath = join(process.env.APP_ROOT_PATH, 'build-before.js');
  if (existsSync(builBeforePath)) {
    await import(builBeforePath).then(({ onBeforeBuild  }) => onBeforeBuild());
  }
}

async function copyBuildFile(folder, globFiles) {
  const files = await globFiles(join(folder, 'dist', '**/*.*'));
  const distFolder = join('dist', basename(folder));
  mkdirp(distFolder);
  return Promise.all(files.map(file => {
    const destFile = join(distFolder, basename(file));
    return copyFileAsync(file, destFile);
  }))
}

async function build() {
  const rootFolder = resolve(), 
    appRootPath = process.env.APP_ROOT_PATH,
    commonFolder = join(rootFolder, 'packages/common/src');

  await Promise.all([ clean('.tmp'), clean('dist') ]);

  const { ngxBuild } = await import(`${commonFolder}/build-package`);
  const { globFiles } = await import(`${commonFolder}/file`);
  
  for (const folder of packages) {
    process.env.APP_ROOT_PATH = join(rootFolder, 'packages', folder);

    const tmpFolder = join(rootFolder, '.tmp', folder);
    const rollupConfigPath = join(process.env.APP_ROOT_PATH, 'rollup.config');

    const { getRollupConfig } = await import(rollupConfigPath);

    const rollupConfig = getRollupConfig({
      input: join(tmpFolder, `${folder}.ts`),
      tsconfig: join(tmpFolder, 'tsconfig.json'),
      output: {
        file: join(process.env.APP_ROOT_PATH , 'dist', `${folder}.js`),
        format: 'cjs'
      }
    })

    await onBuildBeforeHook();
    await ngxBuild(folder, rollupConfig);
    await onBuildAfterHook();

    await copyBuildFile(process.env.APP_ROOT_PATH, globFiles);
  }

  process.env.APP_ROOT_PATH = appRootPath;
}

export { build }