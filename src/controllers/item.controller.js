import itemService from '../services/item.service.js';
import { getPagination, getPagingData } from '../utils/pagination.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const findAll = async (req, res, next) => {
  try {
    const { page, size, category, rarity, minLevel, name } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const filter = {};
    if (category) filter.categoryid = parseInt(category);
    if (rarity) filter.rarityid = parseInt(rarity);
    if (minLevel) filter.levelreq = { [Op.gte]: parseInt(minLevel) };
    if (name) filter.name = { [Op.iLike]: `%${name}%` };
    
    const data = await itemService.findAll(filter, { limit, offset });
    const response = getPagingData(data, page, limit);
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error in findAll items:', error);
    next(error);
  }
};

export const findOne = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const item = await itemService.findById(id);
    
    if (!item) {
      return res.status(404).json({
        message: `Item with ID ${id} not found`
      });
    }
    
    res.status(200).json(item);
  } catch (error) {
    logger.error(`Error in findOne item ${req.params.id}:`, error);
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const newItem = await itemService.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    logger.error('Error in create item:', error);
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updatedItem = await itemService.update(id, req.body);
    
    if (!updatedItem) {
      return res.status(404).json({
        message: `Item with ID ${id} not found`
      });
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    logger.error(`Error in update item ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await itemService.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        message: `Item with ID ${id} not found`
      });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error(`Error in delete item ${req.params.id}:`, error);
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const { query, page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }
    
    const items = await itemService.search(query, { limit, offset });
    const count = items.length;
    
    const response = {
      items,
      meta: {
        totalItems: count,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page ? parseInt(page) : 0
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error in search items:', error);
    next(error);
  }
};

export default {
  findAll,
  findOne,
  create,
  update,
  delete: deleteItem,
  search
};