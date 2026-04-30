import fs from 'fs';

let s = fs.readFileSync('api/index.ts', 'utf8');
s = s.replace(/app\.(get|post|put|delete)\(/g, 'apiRouter.$1(');

const endMount = `
app.use('/', apiRouter);
app.use('/api', apiRouter);

// Catch-all to prevent timeouts
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.url, path: req.path });
});

export default app;
`;

s = s.replace(/export default app;[\s\n]*$/, endMount);
fs.writeFileSync('api/index.ts', s);
console.log('Fixed api/index.ts');
