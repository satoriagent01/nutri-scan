import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { createRouter } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDb();
app.use('/api', createRouter());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
