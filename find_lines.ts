import * as fs from 'fs';

const src = fs.readFileSync('src/App.tsx', 'utf8');
const lines = src.split('\n');

const extractComponent = (name: string) => {
    let startIdx = -1;
    for (let i=0; i<lines.length; i++) {
        if (lines[i].startsWith('const ' + name + ' = ') || lines[i].startsWith('function ' + name + '(')) {
            startIdx = i;
            break;
        }
    }
    if (startIdx === -1) return [null, null];
    
    // Find the end by counting braces
    let braceCount = 0;
    let started = false;
    let endIdx = -1;
    for (let i=startIdx; i<lines.length; i++) {
        const line = lines[i];
        // skip comments for counting braces if possible, but simplest way is to just count '{' and '}'
        // Beware of '{' inside strings. This simple parser might fail. We'll use a better approach.
        
        // Actually, just searching for the brace characters is risky due to strings/templates.
        // But let's try.
        let insideString = false;
        let stringChar = '';
        let insideTemplate = false;
        
        for (let j=0; j<line.length; j++) {
            const char = line[j];
            const prevChar = j > 0 ? line[j-1] : '';
            
            if (!insideString && !insideTemplate) {
                if (char === "'" || char === '"') {
                    insideString = true;
                    stringChar = char;
                } else if (char === "\`") {
                    insideTemplate = true;
                } else if (char === '{') {
                    braceCount++;
                    started = true;
                } else if (char === '}') {
                    braceCount--;
                }
            } else if (insideString) {
                if (char === stringChar && prevChar !== '\\') {
                    insideString = false;
                }
            } else if (insideTemplate) {
                if (char === "\`" && prevChar !== '\\') {
                    insideTemplate = false;
                }
                // we ignore ${} interpolation inside templates for brace count to stay simple,
                // actually wait, if we see ${ we increment brace count, and when we see } we decrement,
                // but if we are inside a template string it doesn't matter unless we support interpolation perfectly.
                // let's just use naive one.
            }
        }
        if (started && braceCount === 0) {
            endIdx = i;
            break;
        }
    }
    return [startIdx, endIdx];
};

const componentsToExtract = ['HasilBulananTable', 'DraggableReportTab', 'FloatingInput', 'ReportSummarySection'];
for (const comp of componentsToExtract) {
    const [start, end] = extractComponent(comp);
    console.log(comp + ':', start, 'to', end);
}
