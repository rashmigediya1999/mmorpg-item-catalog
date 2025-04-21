import express from 'express';
import itemController from '../controllers/item.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Item management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /items:
 *   get:
 *     tags: [Items]
 *     summary: Get all items with optional filtering
 *     parameters:
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
 *       - name: category
 *         in: query
 *         schema:
 *           type: integer
 *         description: Category ID filter
 *       - name: rarity
 *         in: query
 *         schema:
 *           type: integer
 *         description: Rarity ID filter
 *       - name: minLevel
 *         in: query
 *         schema:
 *           type: integer
 *         description: Minimum level requirement
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: Item name search (partial match)
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', itemController.findAll);

/**
 * @swagger
 * /items/search:
 *   get:
 *     tags: [Items]
 *     summary: Search items by name or description
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *         description: Search results
 *       400:
 *         description: Missing search query
 */
router.get('/search', itemController.search);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     tags: [Items]
 *     summary: Get an item by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details
 *       404:
 *         description: Item not found
 */
router.get('/:id', itemController.findOne);

/**
 * @swagger
 * /items:
 *   post:
 *     tags: [Items]
 *     summary: Create a new item
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               price:
 *                 type: integer
 *               levelReq:
 *                 type: integer
 *               categoryid:
 *                 type: integer
 *               rarityid:
 *                 type: integer
 *               stats:
 *                 type: object
 *               isTradable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, authorize(['Admin']), itemController.create);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     tags: [Items]
 *     summary: Update an item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
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
 *               imageUrl:
 *                 type: string
 *               price:
 *                 type: integer
 *               levelReq:
 *                 type: integer
 *               categoryid:
 *                 type: integer
 *               rarityid:
 *                 type: integer
 *               stats:
 *                 type: object
 *               isTradable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 */
router.put('/:id', authenticate, authorize(['Admin']), itemController.update);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     tags: [Items]
 *     summary: Delete an item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', authenticate, authorize(['Admin']), itemController.delete);

export default router;