import { join, dirname, resolve } from 'path';
import { existsSync, statSync, readlinkSync, unlink, symlink } from 'fs';
import { clean } from './clean';
import { mkdirp } from './mkdirp';
import { promisify } from 'util';

const unlinkAsync = promisify(unlink);
const symlinkAsync = promisify(symlink);

async function symlinkPackages(src, dest) {
  const srcNodeModules = join(src, 'node_modules');
  return ((existsSync(srcNodeModules) && statSync(srcNodeModules).isDirectory())
    ? readlinkSync(srcNodeModules) === join(resolve(), 'node_modules')
      ? unlinkAsync(srcNodeModules)
      : clean(srcNodeModules)
    : Promise.resolve()
  ).then(() => {
    mkdirp(dirname(dest))
    return symlinkAsync(join(resolve(), src), dest, 'dir');
  })
}

export { symlinkPackages }