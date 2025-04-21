import Item from './item.model.js';
import Category from './category.model.js';
import Rarity from './rarity.model.js';
import User from './user.model.js';
import Role from './role.model.js';
import Inventory from './inventory.model.js';

// Item associations
Item.belongsTo(Category, { foreignKey: 'categoryid' });
Item.belongsTo(Rarity, { foreignKey: 'rarityid' });
Category.hasMany(Item, { foreignKey: 'categoryid' });
Rarity.hasMany(Item, { foreignKey: 'rarityid' });

// User associations
User.belongsTo(Role, { foreignKey: 'roleid' });
Role.hasMany(User, { foreignKey: 'roleid' });

// Inventory associations (many-to-many relationship between User and Item)
User.belongsToMany(Item, { through: Inventory, foreignKey: 'userid' });
Item.belongsToMany(User, { through: Inventory, foreignKey: 'itemid' });
Inventory.belongsTo(User, { foreignKey: 'userid' });
Inventory.belongsTo(Item, { foreignKey: 'itemid' });
User.hasMany(Inventory, { foreignKey: 'userid' });
Item.hasMany(Inventory, { foreignKey: 'itemid' });

export {
  Item,
  Category,
  Rarity,
  User,
  Role,
  Inventory
};