import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import { getSupabase, isMissingTableError } from './db.js';

import pruningRoutes from './routes/pruning.routes.js';
import merumputRoutes from './routes/merumput.routes.js';
import hasilRoutes from './routes/hasil.routes.js';
import fertilizerRoutes from './routes/fertilizer.routes.js';
import hantaranRoutes from './routes/hantaran.routes.js';

console.log("Loading API routes from api/index.ts...");

dotenv.config();

const app = express();

// Add JSON middleware for standalone Vercel execution
app.use(express.json());

const apiRouter = express.Router();

// Request logging middleware
apiRouter.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Applet specific routes
apiRouter.use("/", hantaranRoutes);
apiRouter.use("/", fertilizerRoutes);
apiRouter.use("/pruning", pruningRoutes);
apiRouter.use("/", merumputRoutes);
apiRouter.use("/", hasilRoutes);

apiRouter.get("/supabase-config.js", (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.__SUPABASE_URL__ = ${JSON.stringify(supabaseUrl)}; window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(supabaseAnonKey)};`);
});

apiRouter.get("/debug-db", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('hantaran_hasil')
        .select('id, no_resit, tarikh, masa_masuk, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      res.json({ data, error });
    } else {
      res.json({ error: "No Supabase" });
    }
  } catch (err: any) {
    res.json({ error: err.message });
  }
});

// Mount the apiRouter
app.use('/api', apiRouter);
// Additionally, allow base path for standard Express deployment / tests
app.use('/', apiRouter);

// Catch-all to prevent timeouts
app.use('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.baseUrl.startsWith('/api')) {
    res.status(404).json({ error: 'Route not found: ' + req.url, path: req.path });
  } else {
    next();
  }
});

export default app;
