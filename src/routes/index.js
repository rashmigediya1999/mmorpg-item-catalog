import express from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import itemRoutes from './item.routes.js';
import inventoryRoutes from './inventory.routes.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);
router.use('/inventory', inventoryRoutes);


export default router;