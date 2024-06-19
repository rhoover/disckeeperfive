const fs = require('fs');
const path = require('path');

module.exports = function() {
  let foldersToInclude = [ 'css', 'fonts', 'js/scripts', 'img/home', 'pages' ];
  
  // only html from root
  let filesToInclude = fs.readdirSync('dist').filter(function(file) {
    return path.extname(file) === '.html';
  });

  // get only the image in the header
  let headerImage = fs.readdirSync('dist/img/dk-icns').filter(function(file) {
    return file === 'android-chrome-48x48.png';
  });
  filesToInclude.push('/img/dk-icns/' + headerImage[0]);

  // add webmanifest to array
  filesToInclude.push('/manifest.webmanifest');

  // add the service worker itself to array
  filesToInclude.push('/disckeeper-service-worker-min.js');

  // go through each endpoint folder to extract each file with file-path to stuff into final array
  // this is the main stuff, consider it partial offline capable
  foldersToInclude.forEach((folder) => {
    let tempFolder = fs.readdirSync('dist/' + folder);
    tempFolder.forEach((file) => {
        filesToInclude.push('/' + folder + '/' + file);
    });
  });

  // write file containing array of files with their path
    fs.writeFileSync(
      'dist/service-worker-data.json',
      JSON.stringify(filesToInclude)
    );
};