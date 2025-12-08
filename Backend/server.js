import { createServer } from 'http';
import app from './src/app.js';
import { PORT } from './src/config/config.js';

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
