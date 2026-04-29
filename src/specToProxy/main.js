// main.js
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { writeFiles } from './utils/writeFiles.js';

const buildproxyfile = './resources/proxytobuild.json';

async function ProxyBuild(filePath) {
  // Create a stream to read the file line by line
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Starting Proxy Build Process...");

  // Use for-await...of to respect the asynchronous writeFiles call
  for await (const line of rl) {
    if (!line.trim()) continue; // Skip empty lines

    try {
      const buildvalues = JSON.parse(line);
      console.log(`Building proxy: ${buildvalues.proxyname}`);
      console.log(`Template Name: ${buildvalues.templatename}`);

      // Define the target directory
      const dir = `../../src/gateway/${buildvalues.proxyname}`;

      // CRITICAL: We now await the write process before moving to the next line
      await writeFiles(dir, buildvalues);

      console.log(`Finished proxy: ${buildvalues.proxyname}`);
    } catch (err) {
      console.error(`Error processing line: ${line}`);
      console.error(err);
    }
  }

  console.log("All proxies processed successfully.");
}

// Execute the async function
ProxyBuild(buildproxyfile).catch(err => {
  console.error("Global Build Error:", err);
});