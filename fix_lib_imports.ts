import * as fs from 'fs';

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace('./lib/ocrParser', './utils/ocrParser');
appTsx = appTsx.replace('@/lib/supabaseClient', './services/supabaseClient');
appTsx = appTsx.replace('./lib/historicalYieldData', './utils/historicalYieldData');

fs.writeFileSync('src/App.tsx', appTsx);
