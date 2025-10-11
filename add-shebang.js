#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dist', 'index.js');
const shebang = '#!/usr/bin/env node\n';

if (!fs.existsSync(filePath)) {
  console.error('dist/index.js not found. Build first.');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
if (!content.startsWith(shebang)) {
  fs.writeFileSync(filePath, shebang + content, 'utf8');
  console.log('Shebang added to dist/index.js');
} else {
  console.log('Shebang already present in dist/index.js');
}
