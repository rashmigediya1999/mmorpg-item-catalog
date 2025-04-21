import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Rarity = sequelize.define('Rarity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  colorCode: {
    type: DataTypes.STRING(7),
    allowNull: false,
    field: 'color_code',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  dropChance: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'drop_chance',
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'rarities',
  timestamps: false
});

export default Rarity;