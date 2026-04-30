const fs = require('fs');

let file = 'src/App.tsx';
let data = fs.readFileSync(file, 'utf8');

// Fix double commas
data = data.replace(/,,/g, ',');

// Jan missing felda_tan
data = data.replace(/pkt2_tan: 837\.72,\n\s*blok/g, 'pkt2_tan: 837.72,\n    felda_tan: 0,\n    blok');

fs.writeFileSync(file, data);
console.log('Fixed');
