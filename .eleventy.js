////////////////////////////////////////////////////
// Declare All The Things
////////////////////////////////////////////////////

// Plugins
const pluginRev = require("eleventy-plugin-rev");
const eleventySass = require("eleventy-sass");
const { DateTime } = require("luxon");

// Filters
const jsMinifier = require("./src/_eleventy/filters/minify-javascript.js");

// Utilities
const sassOptions = require("./src/_eleventy/utilities/sassOptions.js");
const minifyProduction = require("./src/_eleventy/utilities/minify-html.js");
const serviceWorkerData = require("./src/_eleventy/utilities/serviceWorkerData.js");

////////////////////////////////////////////////////
// Let Eleventy Do Its Thing
////////////////////////////////////////////////////

module.exports = function(eleventyConfig) {

  ////////////////////////////////////////////////////
  // Pass Throughs
  ////////////////////////////////////////////////////, 'src/js/scripts'

  ['src/img', {"src/fonts": "fonts"}].forEach(path =>
    eleventyConfig.addPassthroughCopy(path)
    );
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('manifest.webmanifest');
  eleventyConfig.addPassthroughCopy('disckeeper-service-worker-min.js');

  ////////////////////////////////////////////////////
  // Plugins
  ////////////////////////////////////////////////////

  // revision the css filename
  eleventyConfig.addPlugin(pluginRev);

  // let eleventy handle compiling sass
  eleventyConfig.addPlugin(eleventySass, sassOptions);

  ////////////////////////////////////////////////////
  // Filters
  ////////////////////////////////////////////////////

  // minify inline js codes on the fly, which can happern because of the sym-link between js/inline and _includes
  eleventyConfig.addNunjucksAsyncFilter("jsmin", jsMinifier);

  // luxon date formatter
  eleventyConfig.addFilter("dateFormat", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString();
  });
  
  ////////////////////////////////////////////////////
  // Utilities
  ////////////////////////////////////////////////////

  // minify html for production build
  if (process.env.ELEVENTY_RUN_MODE === 'build') {
    eleventyConfig.addTransform("htmlmin", minifyProduction);
  };

  //create json file for service worker
  // eleventyConfig.on('eleventy.after', serviceWorkerData);
  if (process.env.ELEVENTY_RUN_MODE === 'build') {
    eleventyConfig.on('eleventy.after', serviceWorkerData);
  };

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  };
};