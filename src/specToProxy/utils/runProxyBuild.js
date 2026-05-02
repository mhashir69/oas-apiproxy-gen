import fs from 'fs-extra';
import path from 'path';
import propertiesReader from 'properties-reader';
import { writeFiles } from './writeFiles.js';

export async function runProxyBuild(configPath = './config.properties') {
    console.log(`Checking config at: ${path.resolve(configPath)}`);
    if (!fs.existsSync(configPath)) {
    console.error("The config.properties file was not found at that path!");
    }    
// 1. Read the file as a string manually to strip weird characters/BOM
    let rawContent = fs.readFileSync(configPath, 'utf8');
    
    // Remove Byte Order Mark (BOM) if it exists
    rawContent = rawContent.replace(/^\uFEFF/, '');

    // 2. Load the cleaned string into propertiesReader
    const properties = propertiesReader();
    properties.read(rawContent);

    // DIAGNOSTIC LOOP
     console.log("--- Properties Found ---");
    properties.each((key, value) => {
        console.log(`Key: [${key}] | Value: [${value}]`);
    });
    console.log("------------------------"); 
    
    
    // This gets the directory where main.js (the entry point) lives
    const rootDir = process.cwd();
    //console.log(`Root Directory: ${rootDir}`);
    // Values retrieved from properties file
    const JSON_PATH = properties.get('paths.JSON_FILE');
    const TEMPLATE_DIR = properties.get('paths.TEMPLATE_DIR');
    const SPECS_DIR = properties.get('paths.SPECS_DIR');
    const TARGET_BASE = properties.get('paths.TARGET_BASE');
    

    // Ensure JSON file exists

    if (!fs.existsSync(JSON_PATH)) {
        throw new Error(`Missing JSON file at ${JSON_PATH}`);
    }

    // Read JSON (handling it as an array)
    const items = await fs.readJson(JSON_PATH);
    const proxyList = Array.isArray(items) ? items : [items];

    for (const buildvalues of proxyList) {
        const { proxyname: proxyn, templatename: templaten } = buildvalues;

        if (!proxyn || !templaten) continue;

        console.log(`Processing: ${proxyn} (Template: ${templaten})`);

        const targetDir = path.resolve(TARGET_BASE, proxyn);
        const sourceTemplate = path.resolve(TEMPLATE_DIR, templaten);

        // 1. Setup Directory
        await fs.ensureDir(targetDir);
        
        // 2. Copy Template Files
        await fs.copy(sourceTemplate, targetDir);

        // 3. Rename the base XML (The Shell Script logic)
        const oldXmlPath = path.join(targetDir, 'apiproxy', `${templaten}.xml`);
        const newXmlPath = path.join(targetDir, 'apiproxy', `${proxyn}.xml`);
        if (await fs.pathExists(oldXmlPath)) {
            await fs.move(oldXmlPath, newXmlPath, { overwrite: true });
        }

        // 4. Call writeFiles to handle variable replacement/templating
        // We pass the target directory and the specific values for that proxy
        await writeFiles(targetDir, buildvalues);
        
        console.log(`Successfully completed build for: ${proxyn}`);
    }
}