import { promisify } from 'util';
import { resolve } from 'path';
import { readdir, stat as _stat, readFile } from 'fs';

const readdirAsync = promisify(readdir);
const statAsync = promisify(_stat);
const fsreadAsync = promisify(readFile);

/**
 * Recursively gets all file paths from a directory
 */
export async function getFilesPath(dir) {
  const subdirs = await readdirAsync(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await statAsync(res)).isDirectory() ? getFilesPath(res) : res;
    })
  );
  return files.flat();
}

/**
 * Reads content of multiple files in parallel
 */
export async function readFiles(files) {
  return await Promise.all(files.map(async (file) => {
    try {
      const content = await fsreadAsync(file, { encoding: 'utf8' });
      // console.log('CONTENT:', content);
      return content;
    } catch (err) {
      console.error(`ERROR reading ${file}:`, err);
      return null; // Return null so Promise.all doesn't reject entirely
    }
  }));
}
