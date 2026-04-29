const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const fsread = promisify(fs.readFile);


export async function getFilesPath(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFilesPath(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

export async function readFiles(files) {
   await Promise.all(files.map(async (file) => {
    await fsread(file, { encoding: 'utf8' })
//      .then((text) => { console.log('CONTENT:', text); })
      //.then((text) => { console.log('CONTENT:', text.length); })
      .catch((err) => { console.log('ERROR:', err); })

  }))
}
