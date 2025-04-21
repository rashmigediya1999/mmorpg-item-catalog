import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT
  }, 
  parentid: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
}, {
  tableName: 'categories',
  timestamps: false
});

// Self-referential relationship for hierarchy
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentid' });
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentid' });

export default Category;