/**
 * Database seeding script
 * Populates the database with initial data for development and testing
 */

import { sequelize } from '../src/config/database.js';
import { Role, User, Category, Rarity, Item } from '../src/models/index.js';
import bcrypt from 'bcryptjs';
import logger from '../src/utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding process...');

    // Connect to the database
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models (only in development)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    // Seed roles
    const roleCount = await Role.count();
    if (roleCount === 0) {
      logger.info('Seeding roles...');
      await Role.bulkCreate([
        { id: 1, name: 'Admin', description: 'Administrator with full access' },
        { id: 2, name: 'Player', description: 'Regular player account' }
      ]);
    } else {
      logger.info('Roles already exist, skipping...');
    }

    // Seed admin user
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      logger.info('Creating admin user...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        roleid: 1
      });
    } else {
      logger.info('Admin user already exists, skipping...');
    }

    // Seed rarities
    const rarityCount = await Rarity.count();
    if (rarityCount === 0) {
      logger.info('Seeding rarities...');
      await Rarity.bulkCreate([
        { name: 'Common', colorCode: '#AAAAAA', dropChance: 70.00 },
        { name: 'Uncommon', colorCode: '#00AA00', dropChance: 20.00 },
        { name: 'Rare', colorCode: '#0000AA', dropChance: 8.00 },
        { name: 'Epic', colorCode: '#AA00AA', dropChance: 1.50 },
        { name: 'Legendary', colorCode: '#FFA500', dropChance: 0.50 }
      ]);
    } else {
      logger.info('Rarities already exist, skipping...');
    }

    // Seed categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      logger.info('Seeding top-level categories...');
      
      // Create top-level categories
      const topCategories = await Category.bulkCreate([
        { name: 'Weapons', description: 'Items used to deal damage123' },
        { name: 'Armor', description: 'Items used for protection' },
        { name: 'Consumables', description: 'Items that can be used once' },
        { name: 'Materials', description: 'Crafting materials' }
      ]);
      
      // Map to get category IDs by name
      const categoryMap = topCategories.reduce((map, category) => {
        map[category.name] = category.id;
        return map;
      }, {});
      
      logger.info('Seeding subcategories...');
      
      // Create subcategories with parent references
      await Category.bulkCreate([
        { name: 'Swords', description: 'Melee weapons', parentid: categoryMap['Weapons'] },
        { name: 'Bows', description: 'Ranged weapons', parentid: categoryMap['Weapons'] },
        { name: 'Staves', description: 'Magic weapons', parentid: categoryMap['Weapons'] },
        { name: 'Helmets', description: 'Head protection', parentid: categoryMap['Armor'] },
        { name: 'Chestplates', description: 'Body protection', parentid: categoryMap['Armor'] },
        { name: 'Potions', description: 'Magical brews', parentid: categoryMap['Consumables'] },
        { name: 'Scrolls', description: 'Magical writings', parentid: categoryMap['Consumables'] },
        { name: 'Ores', description: 'Metal materials', parentid: categoryMap['Materials'] },
        { name: 'Gems', description: 'Precious stones', parentid: categoryMap['Materials'] }
      ]);
    } else {
      logger.info('Categories already exist, skipping...');
    }

    // Seed items only if none exist
    const itemCount = await Item.count();
    if (itemCount === 0) {
      logger.info('Seeding items...');
      
      // Get category and rarity IDs
      const swordsCategory = await Category.findOne({ where: { name: 'Swords' } });
      const bowsCategory = await Category.findOne({ where: { name: 'Bows' } });
      const stavesCategory = await Category.findOne({ where: { name: 'Staves' } });
      const helmetsCategory = await Category.findOne({ where: { name: 'Helmets' } });
      const chestplatesCategory = await Category.findOne({ where: { name: 'Chestplates' } });
      const potionsCategory = await Category.findOne({ where: { name: 'Potions' } });
      const scrollsCategory = await Category.findOne({ where: { name: 'Scrolls' } });
      const oresCategory = await Category.findOne({ where: { name: 'Ores' } });
      const gemsCategory = await Category.findOne({ where: { name: 'Gems' } });
      
      const commonRarity = await Rarity.findOne({ where: { name: 'Common' } });
      const uncommonRarity = await Rarity.findOne({ where: { name: 'Uncommon' } });
      const rareRarity = await Rarity.findOne({ where: { name: 'Rare' } });
      
      // Create sample items
      await Item.bulkCreate([
        // Weapons
        {
          name: 'Iron Sword',
          description: 'A basic sword made of iron',
          price: 100,
          levelReq: 1,
          categoryid: swordsCategory.id,
          rarityid: commonRarity.id,
          stats: { attack: 10, durability: 100 },
          isTradable: true
        },
        {
          name: 'Steel Sword',
          description: 'A well-crafted sword made of steel',
          price: 250,
          levelReq: 5,
          categoryid: swordsCategory.id,
          rarityid: uncommonRarity.id,
          stats: { attack: 20, durability: 150 },
          isTradable: true
        },
        {
          name: 'Flaming Blade',
          description: 'A magical sword imbued with fire',
          price: 1000,
          levelReq: 15,
          categoryid: swordsCategory.id,
          rarityid: rareRarity.id,
          stats: { attack: 35, fire_damage: 15, durability: 200 },
          isTradable: true
        },
        {
          name: 'Elven Bow',
          description: 'A finely crafted bow from elven woods',
          price: 250,
          levelReq: 5,
          categoryid: bowsCategory.id,
          rarityid: uncommonRarity.id,
          stats: { attack: 15, range: 30, durability: 80 },
          isTradable: true
        },
        {
          name: 'Staff of Fireballs',
          description: 'Shoots powerful fireballs',
          price: 500,
          levelReq: 10,
          categoryid: stavesCategory.id,
          rarityid: rareRarity.id,
          stats: { attack: 8, magic: 25, durability: 60 },
          isTradable: true
        },
        
        // Armor
        {
          name: 'Iron Helmet',
          description: 'Basic head protection',
          price: 80,
          levelReq: 1,
          categoryid: helmetsCategory.id,
          rarityid: commonRarity.id,
          stats: { defense: 5, durability: 100 },
          isTradable: true
        },
        {
          name: 'Steel Chestplate',
          description: 'Solid chest protection',
          price: 200,
          levelReq: 5,
          categoryid: chestplatesCategory.id,
          rarityid: uncommonRarity.id,
          stats: { defense: 20, durability: 150 },
          isTradable: true
        },
        
        // Consumables
        {
          name: 'Health Potion',
          description: 'Restores 50 health points',
          price: 25,
          levelReq: 1,
          categoryid: potionsCategory.id,
          rarityid: commonRarity.id,
          stats: { restore_health: 50, instant: true },
          isTradable: true
        },
        {
          name: 'Mana Potion',
          description: 'Restores 50 mana points',
          price: 25,
          levelReq: 1,
          categoryid: potionsCategory.id,
          rarityid: commonRarity.id,
          stats: { restore_mana: 50, instant: true },
          isTradable: true
        },
        {
          name: 'Scroll of Teleportation',
          description: 'Teleports to a saved location',
          price: 100,
          levelReq: 10,
          categoryid: scrollsCategory.id,
          rarityid: rareRarity.id,
          stats: { uses: 1 },
          isTradable: true
        },
        
        // Materials
        {
          name: 'Iron Ore',
          description: 'Used for crafting iron items',
          price: 10,
          levelReq: 1,
          categoryid: oresCategory.id,
          rarityid: commonRarity.id,
          stats: { purity: 0.8 },
          isTradable: true
        },
        {
          name: 'Ruby',
          description: 'A precious red gemstone',
          price: 150,
          levelReq: 1,
          categoryid: gemsCategory.id,
          rarityid: rareRarity.id,
          stats: { quality: 0.9, size: "medium" },
          isTradable: true
        }
      ]);
    } else {
      logger.info('Items already exist, skipping...');
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Execute the seeding function
seedDatabase()
  .then(() => {
    logger.info('Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seeding process failed:', error);
    process.exit(1);
  });