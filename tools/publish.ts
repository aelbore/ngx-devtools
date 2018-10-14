import { build } from './build';
import { join, resolve } from 'path';

const exec =  require('child_process').exec;

const packages = [ 'common', 'build', 'server', 'task' ];

async function publish() {
  return build().then(async () => {
    for (const folder of packages) {
      console.log(`${resolve(`packages/${folder}/dist`)}`)
    }
  })
}

export { publish }