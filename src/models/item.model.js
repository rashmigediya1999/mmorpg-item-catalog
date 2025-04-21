import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  levelreq: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'levelreq',
    validate: {
      min: 1
    }
  },
  
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isTradable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_tradable'
  }
}, {
  tableName: 'items',
  timestamps: true,
  underscored: true
});

export default Item;