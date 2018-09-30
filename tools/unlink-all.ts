import { resolve, join } from 'path';
import { promisify } from 'util';
import { statSync, existsSync, readlinkSync, unlink } from 'fs';

import { clean } from './clean';

const exec =  require('child_process').exec;

const unlinkAsync = promisify(unlink);

export async function unlinkAll() {
  const packages = [ 'common', 'build', 'server', 'task' ];
  return Promise.all(packages.map(async folder => {
    const dest = join(resolve(), 'packages', folder, 'node_modules');
    await Promise.all([ clean(`packages/${folder}/dist`), clean(`packages/${folder}/.tmp`) ])
    return (existsSync(dest) && statSync(dest).isDirectory())
      ? readlinkSync(dest) === join(resolve(), 'node_modules') ? unlinkAsync(dest): clean(dest)
      : Promise.resolve()
  }))
  .then(() => exec(`git submodule update`))
}
