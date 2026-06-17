import fs from 'fs';

const content = fs.readFileSync('api/index.ts', 'utf-8');

const regex = /(\/\/ API Routes\napiRouter\.post\("\/hantaran"[\s\S]*?)(?=\n\napiRouter\.use\("\/", fertilizerRoutes\);)/;

const match = content.match(regex);

if (match) {
    const hantaran_block = match[1];
    
    const routes_content = hantaran_block.replace(/apiRouter\./g, 'router.');
    
    const routes_file_content = `import express from 'express';
import { getSupabase, isMissingTableError } from '../db';
import { getLocalHantaran, saveLocalHantaran } from '../local';

const router = express.Router();

// Global Cache for hantaran records to optimize application loading speed
let hantaranCache: any[] | null = null;

${routes_content}

export default router;
`;
    fs.writeFileSync('api/routes/hantaran.routes.ts', routes_file_content);

    let new_content = content.replace(hantaran_block, 'apiRouter.use("/", hantaranRoutes);');
    
    // Auto import
    new_content = new_content.replace(
        "import fertilizerRoutes from './routes/fertilizer.routes';",
        "import fertilizerRoutes from './routes/fertilizer.routes';\nimport hantaranRoutes from './routes/hantaran.routes';"
    );
    // remove the hantaran Cache from index.ts
    new_content = new_content.replace(/\/\/ Global Cache for hantaran records to optimize application loading speed\nlet hantaranCache: any\[\] \| null = null;/, '');

    fs.writeFileSync('api/index.ts', new_content);
    
    console.log("Successfully extracted hantaran routes.");
} else {
    console.log("Could not find the hantaran routes block.");
}
