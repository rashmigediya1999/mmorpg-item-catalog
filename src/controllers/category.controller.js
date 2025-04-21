import categoryService from '../services/category.service.js';
import { getPagination, getPagingData } from '../utils/pagination.js';
import logger from '../utils/logger.js';

const findAll = async (req, res, next) => {
  try {
    const rootOnly = req.query.rootOnly === 'true';
    const categories = await categoryService.findAll(rootOnly);
    
    res.status(200).json(categories);
  } catch (error) {
    logger.error('Error in findAll categories:', error);
    next(error);
  }
};

const findOne = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.findById(id);
    
    if (!category) {
      return res.status(404).json({
        message: `Category with ID ${id} not found`
      });
    }
    
    res.status(200).json(category);
  } catch (error) {
    logger.error(`Error in findOne category ${req.params.id}:`, error);
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const newCategory = await categoryService.create(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    logger.error('Error in create category:', error);
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updatedCategory = await categoryService.update(id, req.body);
    
    if (!updatedCategory) {
      return res.status(404).json({
        message: `Category with ID ${id} not found`
      });
    }
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    logger.error(`Error in update category ${req.params.id}:`, error);
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await categoryService.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        message: `Category with ID ${id} not found`
      });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error(`Error in delete category ${req.params.id}:`, error);
    next(error);
  }
};

const getItems = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const category = await categoryService.findById(id);
    if (!category) {
      return res.status(404).json({
        message: `Category with ID ${id} not found`
      });
    }
    
    const data = await categoryService.getItems(id, { limit, offset });
    const response = getPagingData(data, page, limit);
    
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error in getItems for category ${req.params.id}:`, error);
    next(error);
  }
};

export default {
  findAll,
  findOne,
  create,
  update,
  delete: deleteCategory,
  getItems
};