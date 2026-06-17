import fs from 'fs';

const content = fs.readFileSync('api/index.ts', 'utf-8');

const regex = /(\/\/ --- HASIL ABW HISTORY ENDPOINTS ---[\s\S]*?)(?=\n\n\/\/ Catch-all)/;

const match = content.match(regex);

if (match) {
    const hasil_block = match[1];
    
    const routes_content = hasil_block.replace(/apiRouter\./g, 'router.');
    
    const routes_file_content = `import express from 'express';
import { getSupabase, isMissingTableError } from '../db';

const router = express.Router();

${routes_content}

export default router;
`;
    fs.writeFileSync('api/routes/hasil.routes.ts', routes_file_content);

    let new_content = content.replace(hasil_block, 'apiRouter.use("/", hasilRoutes);');
    
    // Auto import
    new_content = new_content.replace(
        "import merumputRoutes from './routes/merumput.routes';",
        "import merumputRoutes from './routes/merumput.routes';\nimport hasilRoutes from './routes/hasil.routes';"
    );
    
    fs.writeFileSync('api/index.ts', new_content);
    
    console.log("Successfully extracted hasil routes.");
} else {
    console.log("Could not find the hasil routes block.");
}
