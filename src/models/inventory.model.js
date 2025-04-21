import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './user.model.js';
import Item from './item.model.js';

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userid',
    references: {
      model: User,
      key: 'id'
    }
  },
  itemid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'itemid',
    references: {
      model: Item,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['userid', 'itemid']
    }
  ]
});

// Define relationships
Inventory.belongsTo(User, { foreignKey: 'userid' });
Inventory.belongsTo(Item, { foreignKey: 'itemid' });

export default Inventory;