import express from 'express';
import categoryController from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCategory } from '../middleware/validation.middleware.js';

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     parameters:
 *       - name: rootOnly
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Whether to return only root categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', categoryController.findAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.findOne);

/**
 * @swagger
 * /categories/{id}/items:
 *   get:
 *     tags: [Categories]
 *     summary: Get all items in a category
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: Page number
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of items in category
 *       404:
 *         description: Category not found
 */
router.get('/:id/items', categoryController.getItems);

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentid:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/', 
  authenticate, 
  authorize(['Admin']), 
  validateCategory,
  categoryController.create
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentid:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(['Admin']),
  validateCategory,
  categoryController.update
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['Admin']),
  categoryController.delete
);

export default router;