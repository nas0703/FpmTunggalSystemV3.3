import fs from 'fs';

const content = fs.readFileSync('api/index.ts', 'utf-8');

const regex = /(\/\/ --- MERUMPUT MODULE ENDPOINTS ---[\s\S]*?)(?=\n\napp\.use\('\/api', apiRouter\);)/;

const match = content.match(regex);

if (match) {
    const merumput_block = match[1];
    
    const routes_content = merumput_block.replace(/apiRouter\./g, 'router.');
    
    const routes_file_content = `import express from 'express';
import { getSupabase, isMissingTableError } from '../db';
import { getLocalMerumputProgress, saveLocalMerumputProgress, getLocalMerumputInventory, saveLocalMerumputInventory, getLocalMerumputTransactions, saveLocalMerumputTransactions } from '../local';

const router = express.Router();

${routes_content}

export default router;
`;
    fs.writeFileSync('api/routes/merumput.routes.ts', routes_file_content);

    let new_content = content.replace(merumput_block, 'apiRouter.use("/", merumputRoutes);');
    
    // Auto import
    new_content = new_content.replace(
        "import pruningRoutes from './routes/pruning.routes';",
        "import pruningRoutes from './routes/pruning.routes';\nimport merumputRoutes from './routes/merumput.routes';"
    );
    
    fs.writeFileSync('api/index.ts', new_content);
    
    console.log("Successfully extracted merumput routes.");
} else {
    console.log("Could not find the merumput routes block.");
}
