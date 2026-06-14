const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('Page.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/LENOVO/Proyecto SI1-2/admision_cup_frontend/src/packages');
let modifiedCount = 0;

files.forEach(file => {
    // Skip AdministrativosPage, DashboardPage, and ListaPostulantesPage
    if (file.includes('AdministrativosPage.jsx') || file.includes('DashboardPage.jsx') || file.includes('ListaPostulantesPage.jsx')) return;

    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Inject isCoordinador
    if (!content.includes('isCoordinador')) {
        if (!content.includes('const user =')) {
            content = content.replace(/(export default function \w+\(\) \{)/, "$1\n  const userString = localStorage.getItem('user');\n  const user = userString ? JSON.parse(userString) : {};\n  const isCoordinador = user?.rol === 'Coordinador';\n");
        } else {
            content = content.replace(/(const user = [^;]+;)/, "$1\n  const isCoordinador = user?.rol === 'Coordinador';");
        }
        changed = true;
    }

    // 2. Hide "Nuevo" button (has <Plus />)
    if (content.includes('<Plus ') && !content.includes('{!isCoordinador && (')) {
        content = content.replace(/(<button[^>]*>[\s\S]*?<Plus[\s\S]*?<\/button>)/g, "{!isCoordinador && (\n          $1\n        )}");
        changed = true;
    }

    // 3. Hide Acciones cell (contains <Edit /> or <Trash2 />)
    if ((content.includes('<Edit ') || content.includes('<Trash2 ')) && !content.includes('{!isCoordinador && (')) {
        content = content.replace(/(<td[^>]*text-right[^>]*>[\s\S]*?(?:<Edit|<Trash2)[\s\S]*?<\/td>)/g, "{!isCoordinador && (\n                    $1\n                  )}");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + file);
        modifiedCount++;
    }
});

console.log('Total files modified:', modifiedCount);
