const htmlmin = require("html-minifier");

module.exports = function(content) {

  if (process.env.ELEVENTY_RUN_MODE == "build") {
    
    if( this.page.outputPath && this.page.outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        collapseWhitespace: true
      });
      return minified;
    };
  };

  return content;
};