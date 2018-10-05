
import { clean } from './clean';

import { join, resolve } from 'path';

const packages = [ 'common', 'build' ];

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

    await ngxBuild(folder, rollupConfig);
  }

  process.env.APP_ROOT_PATH = appRootPath;
}

export { build }