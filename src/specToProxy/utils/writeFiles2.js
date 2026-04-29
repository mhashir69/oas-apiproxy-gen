const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
import {  applyhbs } from '../hbs/applyhbs.js'
import { specparse } from '../utils/specparse.js'
import { getFilesPath } from './getFiles.js'
const fsread = promisify(fs.readFile);
const fswrite = promisify(fs.writeFile);

export async function writeFiles(dir, buildvalues) {
   console.log("dir " + dir)
  // console.log("buildvalues  " + buildvalues.basepath)
  console.log('openapi  ' + buildvalues.openapispecfile)
  const files = await getFilesPath(dir);
  files.map((file) => {
      fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
          if (err) throw err;
          let fileobj = path.parse(file);
          if (fileobj.dir.includes('proxies') &&  buildvalues.openapispecfile != 'dummy.yaml') {
            // console.log('File ' + file)
            //let specfile = '../../../apigee-api-specs/specs/' + buildvalues.openapispecfile
			let specfile = '../specs/' + buildvalues.openapispecfile
            specparse(specfile).then(routes => {
              const routevalues = JSON.stringify(routes)
              const routesjson = JSON.parse(routevalues)
			  routesjson['basepath'] = buildvalues.basepath
              let writedata = applyhbs(data, routesjson)
              const regex_flow = /{.*?}/gm;
              const subst = `*`;
              let writedatafinal = writedata.replace(regex_flow, subst);
              //console.log(writedatafinal)
              fs.writeFile(file, writedatafinal, { encoding: 'utf8' }, (err, data) => {
                if (err) throw err;
              //  console.log(writedata)
              });
            });
          } else {
          //  console.log( "openapi spec file " + buildvalues.openapispecfile)
          let writedata = applyhbs(data, buildvalues)
          fs.writeFile(file, writedata, { encoding: 'utf8' }, (err, data) => {
            if (err) throw err;
            //console.log(writedata)
          });
         }
      });
  });
}
