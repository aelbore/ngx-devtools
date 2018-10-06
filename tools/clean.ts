import { existsSync, unlink, lstat, readdir, rmdir } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const unlinkAsync = promisify(unlink);
const lstatAsync = promisify(lstat);
const readdirAsync = promisify(readdir);
const rmdirAsync = promisify(rmdir);

async function clean(dir: string) {
  if (existsSync(dir)) {
    const files = await readdirAsync(dir);
    await Promise.all(files.map(async (file) => {
      const p = join(dir, file);
      const stat = await lstatAsync(p);
      if (stat.isDirectory()) {
        await clean(p);
      } else {
        await unlinkAsync(p);
      }
    }));
    await rmdirAsync(dir);
  }
}

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

export { clean, cleanAll }