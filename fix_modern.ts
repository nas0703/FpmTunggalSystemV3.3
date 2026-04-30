import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

// Remove vertical borders for a cleaner modern Apple/PowerBI look
content = content.replace(/className="border-r border-emerald-200 dark:border-emerald-800\/40 /g, 'className="');
content = content.replace(/className=\{`border-r border-emerald-200 dark:border-emerald-800\/40 /g, 'className={`');

fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
