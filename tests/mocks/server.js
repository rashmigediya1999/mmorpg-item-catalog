import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Create a minimal express app for testing
const app = express();

// Apply essential middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Create a simple mock response for categories endpoint
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Weapons', description: 'Items used for combat' },
    { id: 2, name: 'Armor', description: 'Protective gear' },
    { id: 3, name: 'Consumables', description: 'One-time use items' }
  ]);
});

// Add more mock endpoints as needed

export default app;