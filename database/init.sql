-- Create tables
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parentid INTEGER REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS rarities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color_code VARCHAR(7) NOT NULL,
    drop_chance DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    price INTEGER NOT NULL,
    levelreq INTEGER DEFAULT 1,
    categoryid INTEGER REFERENCES categories(id)  ON DELETE CASCADE,
    rarityid INTEGER REFERENCES rarities(id),
    stats JSONB,
    is_tradable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    roleid INTEGER REFERENCES roles(id) DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
    itemid INTEGER REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userid, itemid)
);

-- Create indexes
-- CREATE INDEX idx_items_category ON items(categoryid);
-- CREATE INDEX idx_items_rarity ON items(rarityid);
-- CREATE INDEX idx_items_levelreq ON items(levelreq);
-- CREATE INDEX idx_categories_parent ON categories(parentid);
-- CREATE INDEX idx_users_role ON users(roleid);
-- -- CREATE INDEX idx_inventory_user ON inventory(userid);
-- CREATE INDEX idx_inventory_item ON inventory(itemid);

-- Insert initial data

-- Roles
INSERT INTO roles (id, name, description) VALUES 
(1, 'Admin', 'Administrator with full access'),
(2, 'Player', 'Regular player account')
ON CONFLICT (id) DO NOTHING;

-- Rarities
INSERT INTO rarities (name, color_code, drop_chance) VALUES
('Common', '#AAAAAA', 70.00),
('Uncommon', '#00AA00', 20.00),
('Rare', '#0000AA', 8.00),
('Epic', '#AA00AA', 1.50),
('Legendary', '#FFA500', 0.50)
ON CONFLICT (name) DO NOTHING;

-- Categories
INSERT INTO categories (name, description, parentid) VALUES
('Weapons', 'Items used to deal damage', NULL),
('Armor', 'Items used for protection', NULL),
('Consumables', 'Items that can be used once', NULL),
('Materials', 'Crafting materials', NULL)
ON CONFLICT (name) DO NOTHING;

-- Parent categories must exist before inserting subcategories
INSERT INTO categories (name, description, parentid) VALUES
('Swords', 'Melee weapons', (SELECT id FROM categories WHERE name = 'Weapons')),
('Bows', 'Ranged weapons', (SELECT id FROM categories WHERE name = 'Weapons')),
('Staves', 'Magic weapons', (SELECT id FROM categories WHERE name = 'Weapons')),
('Helmets', 'Head protection', (SELECT id FROM categories WHERE name = 'Armor')),
('Chestplates', 'Body protection', (SELECT id FROM categories WHERE name = 'Armor')),
('Potions', 'Magical brews', (SELECT id FROM categories WHERE name = 'Consumables')),
('Scrolls', 'Magical writings', (SELECT id FROM categories WHERE name = 'Consumables')),
('Ores', 'Metal materials', (SELECT id FROM categories WHERE name = 'Materials')),
('Gems', 'Precious stones', (SELECT id FROM categories WHERE name = 'Materials'))
ON CONFLICT (name) DO NOTHING;

-- Sample items
INSERT INTO items (name, description, price, levelreq, categoryid, rarityid, stats, is_tradable) VALUES
-- Weapons
('Iron Sword', 'A basic sword made of iron', 100, 1, 
 (SELECT id FROM categories WHERE name = 'Swords'),
 (SELECT id FROM rarities WHERE name = 'Common'),
 '{"attack": 10, "durability": 100}', true),

('Elven Bow', 'A finely crafted bow from elven woods', 250, 5, 
 (SELECT id FROM categories WHERE name = 'Bows'),
 (SELECT id FROM rarities WHERE name = 'Uncommon'),
 '{"attack": 15, "range": 30, "durability": 80}', true),

('Staff of Fireballs', 'Shoots powerful fireballs', 500, 10, 
 (SELECT id FROM categories WHERE name = 'Staves'),
 (SELECT id FROM rarities WHERE name = 'Rare'),
 '{"attack": 8, "magic": 25, "durability": 60}', true),

-- Armor
('Iron Helmet', 'Basic head protection', 80, 1, 
 (SELECT id FROM categories WHERE name = 'Helmets'),
 (SELECT id FROM rarities WHERE name = 'Common'),
 '{"defense": 5, "durability": 100}', true),

('Steel Chestplate', 'Solid chest protection', 200, 5, 
 (SELECT id FROM categories WHERE name = 'Chestplates'),
 (SELECT id FROM rarities WHERE name = 'Uncommon'),
 '{"defense": 20, "durability": 150}', true),

-- Consumables
('Health Potion', 'Restores 50 health points', 25, 1, 
 (SELECT id FROM categories WHERE name = 'Potions'),
 (SELECT id FROM rarities WHERE name = 'Common'),
 '{"restore_health": 50, "instant": true}', true),

('Scroll of Teleportation', 'Teleports to a saved location', 100, 10, 
 (SELECT id FROM categories WHERE name = 'Scrolls'),
 (SELECT id FROM rarities WHERE name = 'Rare'),
 '{"uses": 1}', true),

-- Materials
('Iron Ore', 'Used for crafting iron items', 10, 1, 
 (SELECT id FROM categories WHERE name = 'Ores'),
 (SELECT id FROM rarities WHERE name = 'Common'),
 '{"purity": 0.8}', true),

('Ruby', 'A precious red gemstone', 150, 1, 
 (SELECT id FROM categories WHERE name = 'Gems'),
 (SELECT id FROM rarities WHERE name = 'Rare'),
 '{"quality": 0.9, "size": "medium"}', true)
ON CONFLICT DO NOTHING;

-- Create a default admin user with password 'admin123'
INSERT INTO users (username, email, password_hash, roleid) VALUES
('admin', 'admin@example.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 1)
ON CONFLICT (username) DO NOTHING;