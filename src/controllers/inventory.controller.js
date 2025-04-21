import inventoryService from '../services/inventory.service.js';
import { getPagination, getPagingData } from '../utils/pagination.js';
import logger from '../utils/logger.js';

export const getUserInventory = async (req, res, next) => {
  try {
    const userid = req.params.userid || req.user.id;
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    // Check if user is accessing their own inventory or is an admin
    if (req.user.id !== parseInt(userid) && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        message: 'You do not have permission to view this inventory'
      });
    }
    
    const data = await inventoryService.getUserInventory(userid, { limit, offset });
    const response = getPagingData(data, page, limit);
    
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error in getUserInventory for user ${req.params.userid}:`, error);
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const userid = req.params.userid || req.user.id;
    const { itemid, quantity } = req.body;
    
    if (req.user.id !== parseInt(userid) && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        message: 'You do not have permission to modify this inventory'
      });
    }
    
    if (!itemid) {
      return res.status(400).json({
        message: 'Item ID is required'
      });
    }
    
    const inventoryItem = await inventoryService.addItemToUserInventory(
      userid,
      itemid,
      quantity || 1
    );
    
    res.status(200).json(inventoryItem);
  } catch (error) {
    logger.error(`Error in addItem to inventory for user ${req.params.userid}:`, error);
    next(error);
  }
};

export const updateItemQuantity = async (req, res, next) => {
  try {
    const userid = req.params.userid || req.user.id;
    const itemid = parseInt(req.params.itemid);
    const { quantity } = req.body;
    
    if (req.user.id !== parseInt(userid) && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        message: 'You do not have permission to modify this inventory'
      });
    }
    
    if (!quantity && quantity !== 0) {
      return res.status(400).json({
        message: 'Quantity is required'
      });
    }
    
    const inventoryItem = await inventoryService.updateItemQuantity(
      userid,
      itemid,
      parseInt(quantity)
    );
    
    if (!inventoryItem) {
      return res.status(404).json({
        message: `Item with ID ${itemid} not found in user's inventory`
      });
    }
    
    res.status(200).json(inventoryItem);
  } catch (error) {
    logger.error(`Error in updateItemQuantity for user ${req.params.userid} and item ${req.params.itemid}:`, error);
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const userid = req.params.userid || req.user.id;
    const itemid = parseInt(req.params.itemid);
    
    if (req.user.id !== parseInt(userid) && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        message: 'You do not have permission to modify this inventory'
      });
    }
    
    const deleted = await inventoryService.removeItemFromInventory(userid, itemid);
    
    if (!deleted) {
      return res.status(404).json({
        message: `Item with ID ${itemid} not found in user's inventory`
      });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error(`Error in removeItem for user ${req.params.userid} and item ${req.params.itemid}:`, error);
    next(error);
  }
};