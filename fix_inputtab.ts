import * as fs from 'fs';

let content = fs.readFileSync('src/features/input/components/InputTab.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/features/input/components/InputTab.tsx', content);

console.log('Fixed backslashes');
