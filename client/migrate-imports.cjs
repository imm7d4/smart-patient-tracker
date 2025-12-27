// Migration script to convert relative imports to @ alias
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
let filesUpdated = 0;

function replaceImports(content) {
  let modified = content;

  // Replace imports going up 3 levels
  modified = modified.replace(/from ['"]\.\.\/\.\.\/\.\.\/(api|services|context|components|utils|pages)\//g, "from '@/$1/");

  // Replace imports going up 2 levels
  modified = modified.replace(/from ['"]\.\.\/\.\.\/(api|services|context|components|utils|pages)\//g, "from '@/$1/");

  // Replace imports going up 1 level
  modified = modified.replace(/from ['"]\.\.\/(api|services|context|components|utils)\//g, "from '@/$1/");

  return modified;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const modified = replaceImports(content);

  if (content !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log(`✓ ${path.relative(srcDir, filePath)}`);
    filesUpdated++;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

console.log('🔄 Migrating imports to @ alias...\n');
walkDir(srcDir);
console.log(`\n✅ Migration complete! Updated ${filesUpdated} files.`);

