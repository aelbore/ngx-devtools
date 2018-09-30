import { globFiles, copyFileAsync, mkdirp, writeFileAsync, clean, readFileAsync } from '../packages/common/src/file';
import { rollupBuild, PkgOptions, createRollupConfig  } from '../packages/common/src/build-package';

import { extname, join, resolve, sep, dirname, basename } from 'path';

const packages = [ 'common', 'build', 'server', 'task' ];

async function copyFiles(files, folder) {
  return Promise.all(files.map(file => {
    const destPath = file.replace(join(resolve(), 'packages', folder, 'src'), join('.tmp', folder));
    return copyFileAsync(file, destPath);
  }))
}

async function writeFilePackageEntry(entryFile, files: Array<string>) {
  const filter = file => extname(file) === '.ts';
  const basePath = join(resolve(), 'packages', basename(entryFile, '.ts'), 'src', sep);
  const map = file => `export * from '${file.replace(basePath, './').replace('.ts', '')}';`;
  const sourceFiles = files.filter(filter).map(map).join('\n');
  return writeFileAsync(entryFile, sourceFiles)
}

async function buildCopyPackageFile(name: string, pkgOptions?: PkgOptions) {
  const pkgFilePath = join('packages', name, 'package.json');
  return readFileAsync(pkgFilePath, 'utf8')
    .then(contents => {
      const destPath = join('dist', name, 'package.json');
      mkdirp(dirname(destPath));
      const pkgContent = JSON.parse(contents);
      delete(pkgContent.scripts);
      delete(pkgContent.devDependencies);
      const pkg = { 
        ...pkgContent,  
        ...{ module: `./esm2015/${name}.js` },
        ...{ esm2015: `./esm2015/${name}.js` },
        ...{ typings: `${name}.d.ts` },
        ...{ main: `${name}.js` },
        ...pkgOptions
      };
      return writeFileAsync(destPath, JSON.stringify(pkg, null, 2));
    });
}

async function build() {
  const rootFolder = resolve();

  await Promise.all([ clean(`dist`), clean(`.tmp`) ]) 
  
  for (const folder of packages) {
    const tmpFolder = join(rootFolder, '.tmp', folder);
    const entryFile = join(tmpFolder, `${folder}.ts`);

    await mkdirp(tmpFolder);

    const files  = await globFiles(`packages/${folder}/src/**/*.*`);

    await Promise.all([
      copyFiles(files, folder),
      buildCopyPackageFile(folder),
      writeFilePackageEntry(entryFile, files)
    ]);

    const rollupConfig = createRollupConfig({
      input: entryFile,
      tsconfig: join(tmpFolder, 'tsconfig.json'),
      output: {
        file: join(rootFolder, 'dist', folder, `${folder}.js`),
        format: 'cjs'
      }
    });
    
    await rollupBuild(rollupConfig);
  }
}

export {  build }