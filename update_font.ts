import fs from 'fs';
const file = 'src/features/dashboard/components/HasilBulananTable.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /fontSize: `\$\{Math\.max\(9, 13\.2 \* \(\(zoom \/ 100\) \* renderScale\)\)\}px`,/g,
  'fontSize: `${Math.max(12, 16.5 * ((zoom / 100) * renderScale))}px`,\n    fontWeight: "bold",'
);
fs.writeFileSync(file, content);
console.log("Updated!");
