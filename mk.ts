import * as fs from 'fs';

const dirs = [
  'src/assets/images',
  'src/assets/icons',
  'src/assets/fonts',
  'src/pages',
  'src/layout',
  'src/hooks',
  'src/services',
  'src/features/auth',
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
