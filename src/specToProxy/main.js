// main.js
import { runProxyBuild } from './utils/runProxyBuild.js';

async function init() {
    console.log("Starting Proxy Build Automation...");

    try {
        // This now handles properties, the loop, copying, and writeFiles calls
        await runProxyBuild('./config.properties');
        
        console.log("Entire build process finished successfully.");
    } catch (err) {
        console.error("Global Build Error:", err.message);
        process.exit(1);
    }
}

init();