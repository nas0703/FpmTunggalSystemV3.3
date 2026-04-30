import * as fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

const components = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^\s*(const|function|let|var) [A-Z][a-zA-Z0-9_]*\s*=/)) {
    components.push(i + ': ' + line.substring(0, 50));
  }
}

console.log(components.join('\n'));
