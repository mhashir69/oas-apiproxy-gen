// 1. Change require to import
import Handlebars from "handlebars";

// 2. Add your custom helpers
Handlebars.registerHelper("loud", function (aString) {
  return aString.toUpperCase();
});

// 3. Change module.exports to export function
export function applyhbs(data, values) {
  const template = Handlebars.compile(data);
  return template(values);
}