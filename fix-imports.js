const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

function kebabCase(str) {
  // Convert something like "AlertDialog" to "alert-dialog", "Button" to "button"
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function processDirectory(dir) {
  walk(dir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      // match "from '@/components/ui/SomeComponent'" and replace
      let newContent = content.replace(/from\s+['"]@\/components\/ui\/([^'"]+)['"]/g, (match, p1) => {
        return "from '@/components/ui/" + kebabCase(p1) + "'";
      });
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed', filePath);
      }
    }
  });
}

processDirectory('./app');
processDirectory('./components');
console.log('Done!');
