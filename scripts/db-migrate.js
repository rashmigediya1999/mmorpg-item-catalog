// scripts/db-migrate.js
/**
 * Database migration script
 * Manages schema migrations for the database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/config/database.js';
import logger from '../src/utils/logger.js';

// Get current file directory (ES6 module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing migration files
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Create migrations table if it doesn't exist
async function initMigrationsTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('Migrations table initialized');
  } catch (error) {
    logger.error('Failed to initialize migrations table:', error);
    throw error;
  }
}

// Get all executed migrations from the database
async function getExecutedMigrations() {
  try {
    const [migrations] = await sequelize.query(
      'SELECT name FROM migrations ORDER BY id ASC'
    );
    return migrations.map(migration => migration.name);
  } catch (error) {
    logger.error('Failed to get executed migrations:', error);
    throw error;
  }
}

// Get all migration files from migrations directory
function getMigrationFiles() {
  try {
    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
      logger.info('Created migrations directory');
      return [];
    }
    
    // Get all .js files in migrations directory
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort alphabetically to ensure correct order
      
    return files;
  } catch (error) {
    logger.error('Failed to get migration files:', error);
    throw error;
  }
}

// Mark a migration as executed in the database
async function markMigrationAsExecuted(migrationName) {
  try {
    await sequelize.query(
      'INSERT INTO migrations (name) VALUES (?)',
      {
        replacements: [migrationName]
      }
    );
    logger.info(`Marked migration as executed: ${migrationName}`);
  } catch (error) {
    logger.error(`Failed to mark migration as executed: ${migrationName}`, error);
    throw error;
  }
}

// Execute a migration file
async function executeMigration(migrationFile) {
  try {
    // Import the migration module dynamically
    const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
    const migration = await import(migrationPath);
    
    // Start transaction for the migration
    const transaction = await sequelize.transaction();
    
    try {
      // Execute the up function of the migration
      if (typeof migration.up === 'function' || typeof migration.default?.up === 'function') {
        logger.info(`Executing migration: ${migrationFile}`);
        
        // Handle both default export and named export
        const upFunction = migration.up || migration.default.up;
        await upFunction(sequelize.queryInterface, sequelize);
      } else {
        throw new Error(`Migration ${migrationFile} does not have an 'up' function`);
      }
      
      // Mark migration as executed
      await markMigrationAsExecuted(migrationFile);
      
      // Commit the transaction
      await transaction.commit();
      
      logger.info(`Successfully executed migration: ${migrationFile}`);
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      logger.error(`Migration failed: ${migrationFile}`, error);
      throw error;
    }
  } catch (error) {
    logger.error(`Error executing migration: ${migrationFile}`, error);
    throw error;
  }
}

// Create a new migration file
function createMigration(name) {
  if (!name) {
    logger.error('Migration name is required');
    process.exit(1);
  }
  
  // Format the filename with timestamp
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const filename = `${timestamp}-${name.toLowerCase().replace(/\s+/g, '-')}.js`;
  const filePath = path.join(MIGRATIONS_DIR, filename);
  
  // Migration template
  const template = `// Migration: ${name}
export const up = async (queryInterface, Sequelize) => {
  // Add your migration code here
  
  // Example:
  // await queryInterface.createTable('table_name', {
  //   id: {
  //     type: Sequelize.INTEGER,
  //     primaryKey: true,
  //     autoIncrement: true
  //   },
  //   name: {
  //     type: Sequelize.STRING,
  //     allowNull: false
  //   },
  //   created_at: {
  //     type: Sequelize.DATE,
  //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  //   }
  // });
};

export const down = async (queryInterface, Sequelize) => {
  // Add your rollback code here
  
  // Example:
  // await queryInterface.dropTable('table_name');
};

export default { up, down };
`;

  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
  
  // Create the migration file
  fs.writeFileSync(filePath, template);
  logger.info(`Created migration: ${filePath}`);
  
  return filename;
}

// Run pending migrations
async function runMigrations() {
  try {
    // Initialize migrations table
    await initMigrationsTable();
    
    // Get all executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    
    // Filter out migrations that have already been executed
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    // Execute pending migrations
    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return 0;
    }
    
    logger.info(`Found ${pendingMigrations.length} pending migrations`);
    
    for (const migrationFile of pendingMigrations) {
      await executeMigration(migrationFile);
    }
    
    logger.info(`Successfully executed ${pendingMigrations.length} migrations`);
    return pendingMigrations.length;
  } catch (error) {
    logger.error('Migration process failed:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Check if creating a new migration
    const createArg = process.argv.indexOf('--create');
    if (createArg !== -1 && process.argv.length > createArg + 1) {
      const migrationName = process.argv[createArg + 1];
      createMigration(migrationName);
      process.exit(0);
    }
    
    // Run migrations
    logger.info('Starting migration process...');
    
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    const migrationsCount = await runMigrations();
    
    logger.info(`Migration process completed: ${migrationsCount} migrations applied`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();