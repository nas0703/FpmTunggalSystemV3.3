import re

with open('api/index.ts', 'r') as f:
    content = f.read()

# Extract merumput routes block
merumput_block_match = re.search(r'(// --- MERUMPUT MODULE ENDPOINTS ---.*?)(?=\n\napp\.use)', content, re.DOTALL)
if merumput_block_match:
    merumput_block = merumput_block_match.group(1)
    
    # Replace 'apiRouter.post("/merumput' with 'router.post("' etc
    # Actually just replace 'apiRouter.' with 'router.' and let express handle "/merumput/..." or we can simplify the path.
    # We will just replace apiRouter with router and not change paths, so we mount it at '/'
    routes_content = merumput_block.replace('apiRouter.', 'router.')
    
    # Create the merumput.routes.ts file
    routes_file_content = f"""import express from 'express';
import {{ getSupabase, isMissingTableError }} from '../db';
import {{ getLocalMerumputProgress, saveLocalMerumputProgress, getLocalMerumputInventory, saveLocalMerumputInventory, getLocalMerumputTransactions, saveLocalMerumputTransactions }} from '../local';

const router = express.Router();

{routes_content}

export default router;
"""
    with open('api/routes/merumput.routes.ts', 'w') as f:
        f.write(routes_file_content)

    # Remove the block from api/index.ts and replace with import and usage
    new_content = content.replace(merumput_block, 'apiRouter.use("/", merumputRoutes);')
    
    with open('api/index.ts', 'w') as f:
        f.write(new_content)
    
    print("Successfully extracted merumput routes.")
else:
    print("Could not find the merumput routes block.")
