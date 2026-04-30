import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

// The headers
content = content.replace(
    'className="sticky top-0 bg-[#0c4a34]/95 backdrop-blur-md dark:bg-[#072d1f]/95 text-[10px] uppercase font-bold tracking-widest text-emerald-100 dark:text-emerald-200 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-b-2 border-emerald-700 dark:border-emerald-800"',
    'className="sticky top-0 bg-emerald-900 text-[10px] uppercase font-black tracking-wider text-white z-30 shadow-md border-b-2 border-emerald-700"'
);

// We need the vertical borders on cells in the body, which my previous slate iteration removed.
// Previously I did: lines[i] = lines[i].split("border-r ").join(" ");
// Let's add them back by replacing the `td` class names where applicable, or just let it be clean modern horizontal borders? PowerBi/Apple have clean subtle horizontal lines, usually without vertical lines or very subtle vertical lines.
// Since the user image has vertical lines, let's restore them. Instead of messing with string manipulation, let's see how much I messed up the `renderRow`.

// In renderRow, td:
content = content.replace(/<td\\s+style=\{zoomStyles\}\\s+className=" /g, '<td style={zoomStyles} className="border-r border-emerald-200 dark:border-emerald-800/40 ');
content = content.replace(/<td\\s+style=\{zoomStyles\}\\s+className={` /g, '<td style={zoomStyles} className={`border-r border-emerald-200 dark:border-emerald-800/40 ');

fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
