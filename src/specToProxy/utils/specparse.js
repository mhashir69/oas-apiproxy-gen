import SwaggerParser from "@apidevtools/swagger-parser";

console.log("Using Swagger Parser Version:", SwaggerParser.version || "Latest/ESM");

function parseJson(paths) {

  let routes = {
    paths: []
  };

  Object.keys(paths).forEach(function(keyPath) {
         // console.log('Path : ' + keyPath)
        Object.keys(paths[keyPath]).forEach(function(keyHttpverb) {
//          console.log('httpVerb : ' + keyHttpverb)
//          console.log('description : ' + paths[keyPath][keyHttpverb].description)
         if (keyHttpverb === 'parameters') {
        //   console.log('httpVerb : ' + keyHttpverb)
         }
         else {
           routes.paths.push({
             "keyPath": keyPath,
             "keyHttpverb": keyHttpverb,
             "description": paths[keyPath][keyHttpverb].description
           })
         }

        })
      })
      // console.log(routes)
      return routes
    }





export async function specparse(specfile) {
  try {
    //let api =  await SwaggerParser.validate(specfile);
    let api = await SwaggerParser.validate(specfile);
    console.log("API name: %s, Version: %s", api.info.title, api.info.version);
    //console.log(api)
    //let key1 = '/'
    //console.log(api.paths[key1])
    let paths = api.paths
    let routes = {
      paths: []
    };

    return routes = parseJson(paths)
  }

  //  console.log(paths)
  catch (err) {
    console.error(err);
  }
}
