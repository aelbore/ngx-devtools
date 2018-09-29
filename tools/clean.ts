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

export { clean }