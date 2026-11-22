
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const siteDirectory = path.resolve(process.env.ROOMIECONNECT_SITE_DIR || 'D:\\Downloads\\RoomieConnect\\RoomieConnect');
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.join(projectDirectory, 'public');


app.get('/', (_req, res) => {
  res.sendFile(path.join(siteDirectory, 'index.html'));
});

app.get('/api/health', (_req, res) => {

if (!process.env.VERCEL) {
const server = app.listen(port);
  const server = app.listen(port);

server.on('listening', () => {
  console.log(`RoomieConnect website and chatbot are running at http://localhost:${port}`);
  console.log(`Serving website files from: ${siteDirectory}`);
  if (!ai) console.log('Add GEMINI_API_KEY to .env to enable Gemini replies.');
});
  server.on('listening', () => {
    console.log(`RoomieConnect website and chatbot are running at http://localhost:${port}`);
    console.log(`Serving website files from: ${siteDirectory}`);
    if (!ai) console.log('Add GEMINI_API_KEY to .env to enable Gemini replies.');
  });

  server.on('error', (error) => {
    console.error(`RoomieConnect server failed to listen on port ${port}:`, error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the existing server before starting another one.`);
    }
    process.exitCode = 1;
  });
}

server.on('error', (error) => {
  console.error(`RoomieConnect server failed to listen on port ${port}:`, error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing server before starting another one.`);
  }
  process.exitCode = 1;
});
export default app;
