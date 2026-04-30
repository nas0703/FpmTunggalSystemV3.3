const fs = require('fs');

let file = 'src/App.tsx';
let data = fs.readFileSync(file, 'utf8');

const feldaData = {
  "Jan": 61.19,
  "Feb": 52.77,
  "Mac": 55.98,
  "Apr": 58.69,
  "Mei": 47.61,
  "Jun": 53.61,
  "Jul": 54.70,
  "Ogos": 100.33,
  "Sep": 85.23,
  "Okt": 84.15,
  "Nov": 87.98,
  "Dis": 62.77
};

for (const [month, tan] of Object.entries(feldaData)) {
  const monthRegex = new RegExp(`(month: "${month}",\\n\\s*yield: .*?,\\n\\s*t_h: .*?,\\n\\s*pkt1_tan: .*?,\\n\\s*pkt2_tan: .*?,\\n\\s*felda_tan: )\\d+(?:\\.\\d+)?,`, 'g');
  data = data.replace(monthRegex, `$1${tan},`);
  
  const blockRegex = new RegExp(`(month: "${month}"[\\s\\S]*?"22": .*?,\\n\\s*"88": )0`, 'g');
  data = data.replace(blockRegex, `$1${tan}`);
}

fs.writeFileSync(file, data);
console.log('Fixed');
