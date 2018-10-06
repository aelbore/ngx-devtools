import { join, resolve } from 'path';
import { existsSync } from 'fs';

import { clean } from './clean';

const packages = [ 'common', 'build', 'server', 'task' ];

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

async function build() {
  const rootFolder = resolve(), appRootPath = process.env.APP_ROOT_PATH;

  await clean(`.tmp`);

  const { ngxBuild } = await import(`${rootFolder}/packages/common/src/build-package`);
  
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
  }

  process.env.APP_ROOT_PATH = appRootPath;
}

export { build }