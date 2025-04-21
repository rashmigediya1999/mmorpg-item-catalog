# Game Catalog API for MMORPG

A comprehensive RESTful API for managing in-game items in an MMORPG, with category management, item catalogs, user authentication, and inventory systems.

## Features

- **Item Management**: Create, read, update, and delete game items
- **Category System**: Hierarchical organization of items
- **Rarity System**: Item rarity levels with color codes and drop rates
- **User Authentication**: JWT-based authentication
- **Role-Based Access Control**: Admin and Player roles
- **Inventory System**: Tracking player item possession
- **API Documentation**: Swagger/OpenAPI documentation
- **Filtering & Pagination**: Flexible API querying

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **Logging**: Winston

## Running the Application

### Prerequisites
- Git
- Docker and Docker Compose

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rashmigediya1999/mmorpg-item-catalog.git
cd mmorpg-item-catalog
```

2. Change  environment files names:
- .env.example to .env
- .env.test.example to .env.test

### Default Admin Access
The system comes with a pre-configured admin account:
- Username: `admin`
- Password: `admin123`

### Using Docker

3. Run everything (application + tests) with a single command:
```bash
docker-compose -f docker-compose.yml up --build
```
This will:
- Start the production database
- Start the test database
- Run all tests (unit + integration)
- Start the application
- Make the API available at http://localhost:3000
- API documentation at http://localhost:3000/api-docs
- Generate test reports at test-reports/test-report.html

You can view the detailed test report by opening:
```
test-reports/test-report.html
```


4. Stop the application:
```bash
docker-compose -f docker-compose.yml down -v
```

## API Documentation

Access the Swagger documentation at http://localhost:3000/api-docs

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/profile` - Get user profile

#### Items
- `GET /api/items` - Get all items (with filtering and pagination)
- `GET /api/items/:id` - Get an item by ID
- `POST /api/items` - Create a new item (admin only)
- `PUT /api/items/:id` - Update an item (admin only)
- `DELETE /api/items/:id` - Delete an item (admin only)
- `GET /api/items/search` - Search items by query

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a category by ID
- `GET /api/categories/:id/items` - Get all items in a category
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)

#### Inventory
- `GET /api/inventory` - Get current user's inventory
- `POST /api/inventory` - Add an item to inventory
- `PUT /api/inventory/:itemid` - Update item quantity
- `DELETE /api/inventory/:itemid` - Remove an item from inventory
- `GET /api/inventory/users/{userid}` - Get a specific user'suser's inventory (admin only)

