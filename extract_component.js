const fs = require('fs');

const appFile = 'src/App.tsx';
let app = fs.readFileSync(appFile, 'utf8');

const tableStart = 'const HasilBulananTable = ({';
const tableEndIndex = app.lastIndexOf('function FloatingInput({'); 
// Assuming DraggableReportTab is before or after it, let's find the exact bounds

// Rather than replacing via string finding, let's find where HasilBulananTable starts and ends.
const sigStart = app.indexOf('const HasilBulananTable = (');

if (sigStart > 0) {
    // We can't easily parse AST here without a library like typescript or babel.
    console.log('Found start at', sigStart);
}
