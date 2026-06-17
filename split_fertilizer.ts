import fs from 'fs';

const content = fs.readFileSync('api/index.ts', 'utf-8');

const regex = /(\/\/ --- FERTILIZER \(BAJA\) MODULE ROUTES ---[\s\S]*?)(?=\n\n\/\/ --- PRUNING MODULE ROUTES ---)/;

const match = content.match(regex);

if (match) {
    const fertilizer_block = match[1];
    
    const routes_content = fertilizer_block.replace(/apiRouter\./g, 'router.');
    
    const routes_file_content = `import express from 'express';
import { getSupabase, isMissingTableError } from '../db';

const router = express.Router();

${routes_content}

export default router;
`;
    fs.writeFileSync('api/routes/fertilizer.routes.ts', routes_file_content);

    let new_content = content.replace(fertilizer_block, 'apiRouter.use("/", fertilizerRoutes);');
    
    // Auto import
    new_content = new_content.replace(
        "import hasilRoutes from './routes/hasil.routes';",
        "import hasilRoutes from './routes/hasil.routes';\nimport fertilizerRoutes from './routes/fertilizer.routes';"
    );
    
    fs.writeFileSync('api/index.ts', new_content);
    
    console.log("Successfully extracted fertilizer routes.");
} else {
    console.log("Could not find the fertilizer routes block.");
}
