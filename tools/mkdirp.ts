import { sep, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

function mkdirp(directory: string) {
  const dirPath = resolve(directory).replace(/\/$/, '').split(sep);
  for (let i = 1; i <= dirPath.length; i++) {
    const segment = dirPath.slice(0, i).join(sep);
    if (!existsSync(segment) && segment.length > 0) {
      mkdirSync(segment);
    }
  }
}

export { mkdirp }