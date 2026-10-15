# Role-Based Backend with Dynamic Module Permissions

A secure, modular, production-ready REST API built with **Node.js, Express.js, PostgreSQL, Sequelize ORM, Zod, and JWT**, supporting three distinct roles: **User**, **Admin**, and **Sub-admin**, with fine-grained, database-backed dynamic module and action permissions.

---

## Key Features

- **Modular Monolith Architecture**: Modular (feature-based) design inside `src/api/v1/modules/` following Controller → Service → Model layer segregation.
- **Environment-Based Admin Initialization**: Dedicated, idempotent initialization script at `scripts/init-admin.js` creates the initial Admin without a database seeder.
- **Dynamic Module & Action Permissions**: Independent permission matrix per Sub-admin with immediate effect upon revocation.
- **Financial Consistency & Concurrency Control**: Wallets and transactions utilize PostgreSQL transactions and `FOR UPDATE` row-level locks, ensuring no overdrafts and an immutable audit ledger.
- **Order & Inventory Synchronization**: Orders reserve stock atomically; cancelling an order releases reserved inventory back to available stock.
- **Centralized Operational Error Handling**: Custom `AppError` class with standardized error responses and sanitized production outputs.
- **Automated Postman & Newman Test Suite**: Complete end-to-end API verification suite covering all 10 business modules and dynamic permission workflows.

---

## Application Modules & Permission Mappings

| Permission Module Identifier | Folder Path | Responsibilities |
|---|---|---|
| `user-mgmt` | `src/api/v1/modules/user` & `admin` | User CRUD operations, status updates, and profile views |
| `subadmin-mgmt` | `src/api/v1/modules/subadmin` | Sub-admin account lifecycle management (Admin only) |
| `orders` | `src/api/v1/modules/orders` | Customer orders, inventory reservation, status transitions |
| `transactions` | `src/api/v1/modules/transactions` | Ledger inspection, transaction reports export, refunds |
| `wallet` | `src/api/v1/modules/wallets` | Atomic balance queries, credits, debits, adjustments |
| `inventory` | `src/api/v1/modules/inventory` | SKU stock management, price updates, stock adjustments |
| `notifications` | `src/api/v1/modules/notifications` | User alerts and broadcast dispatch |
| `faq` | `src/api/v1/modules/faqs` | Knowledge base article CRUD and publication |
| `settings` | `src/api/v1/modules/settings` | System-wide configuration management |
| `help` | `src/api/v1/modules/help` | Customer support ticket submission, assignment, resolution |

---

## Project Structure

```text
├── src/
│   ├── server.js                      # Bootstrap, DB connect, start listener, graceful shutdown
│   ├── app.js                         # Express setup: helmet, cors, rate limit, body parser, router
│   └── api/
│       └── v1/
│           ├── index.js               # v1 master router mounting all module routes
│           ├── modules/               # Feature modules (controller, service, model, routes, validation)
│           │   ├── auth/
│           │   ├── user/
│           │   ├── admin/
│           │   ├── subadmin/
│           │   ├── permissions/
│           │   ├── orders/
│           │   ├── transactions/
│           │   ├── wallets/
│           │   ├── inventory/
│           │   ├── notifications/
│           │   ├── faqs/
│           │   ├── settings/
│           │   └── help/
│           ├── middleware/            # authenticate, authorizeRole, authorizePermission, validate, etc.
│           ├── common/                # logger, AppError, response, pagination
│           ├── config/                # env validation, database connection
│           └── database/
│               ├── models/index.js    # Centralized Sequelize model registry & associations
│               └── migrations/        # PostgreSQL schema migrations
├── scripts/
│   ├── init-admin.js                  # Idempotent Admin creation from .env
│   ├── init-permissions.js            # Idempotent module & action registration
│   └── generate-postman-collection.js # Generates Postman test collection
├── postman/
│   ├── collections/backend-api.postman_collection.json
│   ├── environments/local.postman_environment.json
│   └── README.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Execution Guide

### 1. Configure Environment Variables

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Set the database connection parameters:
```env
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=rbac_backend_db
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

JWT_SECRET=super_secret_jwt_key_for_testing_and_production_security_32chars!
JWT_EXPIRES_IN=1d

ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminSecurePassword!123
```

### 2. Run Database Migrations

Apply PostgreSQL migrations:
```bash
npm run migrate
```

### 3. Initialize Registered Permissions & Admin

Register all business modules and their action definitions:
```bash
npm run init:permissions
```

Bootstrap the initial Admin from environment variables:
```bash
npm run init:admin
```

*(Alternatively, run `npm run bootstrap` to execute migrations, permission initialization, and admin initialization in sequence).*

### 4. Start the Application

Start the Express API server:
```bash
npm start
```
The server will start listening at `http://localhost:4000/api/v1`.

---

## Automated Postman Testing with Newman

Run the complete automated API test suite from your terminal:

```bash
npm run test:api
```

This runs all 16 test suites covering authentication, roles, dynamic permission grant and immediate revocation, financial transactions, orders, inventory, and security checks.
