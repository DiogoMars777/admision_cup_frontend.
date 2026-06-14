import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace 'http://localhost:8000/api'
    content = content.replace(/'http:\/\/localhost:8000\/api'/g, "(import.meta.env.VITE_API_URL || 'http://localhost:8000/api')");
    // Replace "http://localhost:8000/api"
    content = content.replace(/"http:\/\/localhost:8000\/api"/g, '(import.meta.env.VITE_API_URL || "http://localhost:8000/api")');
    // Replace `http://localhost:8000/api
    content = content.replace(/`http:\/\/localhost:8000\/api/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}");
    // fix some double env definitions like import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL
    content = content.replace(/\(import\.meta\.env\.VITE_API_URL \|\| \(import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:8000\/api'\)\)/g, "(import.meta.env.VITE_API_URL || 'http://localhost:8000/api')");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
