import express from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Inventory management endpoints
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Get current user's inventory
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: User's inventory
 *       401:
 *         description: Not authenticated
 */
router.get('/', authenticate, inventoryController.getUserInventory);

/**
 * @swagger
 * /inventory:
 *   post:
 *     tags: [Inventory]
 *     summary: Add an item to current user's inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemid
 *             properties:
 *               itemid:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added to inventory
 *       400:
 *         description: Validation error
 *       404:
 *         description: Item not found
 */
router.post('/', authenticate, inventoryController.addItem);

/**
 * @swagger
 * /inventory/{itemid}:
 *   put:
 *     tags: [Inventory]
 *     summary: Update item quantity in current user's inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemid
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Item quantity updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Item not found in inventory
 */
router.put('/:itemid', authenticate, inventoryController.updateItemQuantity);

/**
 * @swagger
 * /inventory/{itemid}:
 *   delete:
 *     tags: [Inventory]
 *     summary: Remove an item from current user's inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemid
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item removed from inventory
 *       404:
 *         description: Item not found in inventory
 */
router.delete('/:itemid', authenticate, inventoryController.removeItem);

/**
 * @swagger
 * /inventory/users/{userid}:
 *   get:
 *     tags: [Inventory]
 *     summary: Get a specific user's inventory (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
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
 *         description: User's inventory
 *       403:
 *         description: Permission denied
 *       404:
 *         description: User not found
 */
router.get('/users/:userid', authenticate, inventoryController.getUserInventory);

export default router;