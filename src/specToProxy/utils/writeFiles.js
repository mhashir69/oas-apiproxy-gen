import path from 'path';
import { readFile, writeFile } from 'fs/promises'; // Native promises API
import { applyhbs } from '../hbs/applyhbs.js';
import { specparse } from '../utils/specparse.js';
import { getFilesPath } from './getFiles.js';

export async function writeFiles(dir, buildvalues,SPECS_DIR) {
  console.log(`Processing directory: ${dir}`);

  // 1. Get all file paths recursively
  const files = await getFilesPath(dir);

  // 2. Pre-parse the spec ONCE to avoid redundant work
  let routesjson = null;
  if (buildvalues.openapispecfile !== 'dummy.yaml') {
    const specfile = `../specs/${buildvalues.openapispecfile}`;
    //const specfile = `${SPECS_DIR}/${buildvalues.openapispecfile}`;
    const routes = await specparse(specfile);
    routesjson = JSON.parse(JSON.stringify(routes));
    routesjson['basepath'] = buildvalues.basepath;
  }

  // 3. Map files to an array of Promises for parallel processing
  const filePromises = files.map(async (file) => {
    try {
      const data = await readFile(file, { encoding: 'utf8' });
      const fileobj = path.parse(file);
      let writedata = "";

      // Logic for proxy-specific files
      if (fileobj.dir.includes('proxies') && routesjson) {
        writedata = applyhbs(data, routesjson);

        // Post-processing regex for path parameters
        const regex_flow = /{.*?}/gm;
        writedata = writedata.replace(regex_flow, '*');
      } else {
        // Standard template substitution
        writedata = applyhbs(data, buildvalues);
      }

      // Write the file back
      await writeFile(file, writedata, { encoding: 'utf8' });
      return file;
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
      throw err; // Ensure Promise.all catches the failure
    }
  });

  // 4. Wait for all files to complete
  const results = await Promise.all(filePromises);
  console.log(`Successfully updated ${results.length} files.`);
}