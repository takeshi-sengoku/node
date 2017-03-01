var packages = require('./package.json');
var fs = require('fs');

var dependencies = packages.dependencies;
for(var pkgName in dependencies) {
  if(pkgName.indexOf('sample-') !== -1) {
    var deleteDir = './node_modules/' + pkgName;
    var deleteFiles;
    try {
      deleteFiles = fs.readdirSync(deleteDir);
    } catch (e) {
      console.error('directory not found[%s].', deleteDir);
      continue;
    }
    for (var idx in deleteFiles) {
      var deleteFile = deleteDir + '/' + deleteFiles[idx];
      try {
        fs.unlinkSync(deleteFile);
        console.log('delete file %s', deleteFile);
      } catch (e) {
        console.error('file not found[%s].', deleteFile);
        continue;
      }
    }
    try {
      fs.rmdirSync(deleteDir);
      console.log('delete directory %s', deleteDir);
    } catch (e) {
      console.error('directory delete failed[%s].', deleteDir);
    }
  }
}

