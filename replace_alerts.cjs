const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/LENOVO/Proyecto SI1-2/admision_cup_frontend/src';

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Inject import { toast } from 'react-hot-toast'; if not exists
    if (!content.includes("from 'react-hot-toast'")) {
        // Find the last import statement
        const imports = content.match(/^import .* from .*$/gm);
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            content = content.replace(lastImport, lastImport + "\nimport { toast } from 'react-hot-toast';");
        } else {
            content = "import { toast } from 'react-hot-toast';\n" + content;
        }
    }
    
    // Replace alert(...) with toast.error or toast.success depending on the context
    // A simple regex approach:
    // If it says "✅" or "exitosamente" or "correctamente", use success
    content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
        if (p1.toLowerCase().includes('exitosa') || p1.toLowerCase().includes('correctamente') || p1.includes('✅')) {
            return `toast.success(${p1})`;
        }
        return `toast.error(${p1})`;
    });

    fs.writeFileSync(file, content);
    console.log('Updated: ', file);
  }
});
