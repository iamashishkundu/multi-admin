# Postman Automated API Testing

This directory contains the automated test suite for the **Role-Based Backend with Dynamic Module Permissions**.

## Structure

```text
postman/
├── collections/
│   └── backend-api.postman_collection.json
├── environments/
│   └── local.postman_environment.json
└── README.md
```

## Test Folders & Coverage

1. **Health Check:** API status and operational heartbeat.
2. **Authentication:**
   - Registration with password hashing.
   - Login for User, Admin, and Sub-admin accounts.
   - Negative authentication tests: wrong password, unknown email, missing JWT, and malformed JWT.
3. **User Management:** Self-service profile retrieval and update, Admin paginated user listing.
4. **Admin Management:** Viewing administrative audit logs, blocking normal users from audit logs.
5. **Sub-admin Management:**
   - Admin creating sub-admins.
   - Normal users blocked from sub-admin APIs.
   - Sub-admins blocked from creating other sub-admins.
6. **Permission Assignment & Dynamic Workflow:**
   - Step 1: Admin assigns `orders.read` permission to Sub-admin.
   - Step 2: Sub-admin reads orders successfully (`200 OK`).
   - Step 3: Sub-admin attempts to create order without permission (`403 Forbidden`).
   - Step 4: Admin grants `orders.create` permission to Sub-admin.
   - Step 5: Sub-admin creates order with new permission (`201 Created`).
   - Step 6: Admin revokes `orders.create` permission.
   - Step 7: Sub-admin attempts to create order again, immediately rejected (`403 Forbidden`).
   - Step 8: Sub-admin attempts to assign permissions to themselves (`403 Forbidden`).
7. **Inventory Module:** Item creation, retrieval, atomic stock adjustment, preventing negative stock (`400 Bad Request`).
8. **Orders Module:** Order creation with inventory reservation, state transitions, order cancellation releasing stock.
9. **Wallets Module:** Balance inspection, atomic credits, atomic debits, overdraft rejection (`INSUFFICIENT_FUNDS`), manual adjustments.
10. **Transactions Module:** Ledger inspection, reports export, refunds processing.
11. **Notifications Module:** Broadcast sending, user retrieval, marking notifications read.
12. **FAQ Module:** Knowledge base creation, publishing, public retrieval.
13. **Settings Module:** Configuration updates, public setting retrieval.
14. **Help Module:** Ticket submission, staff assignment, resolution notes.
15. **Authorization and Security:** Account deactivation immediately terminating active JWT sessions.
16. **Cleanup:** User and Sub-admin logout, verifying token session invalidation.

## Running Tests via Newman

### 1. Ensure Prerequisites

The backend must be running:
```bash
npm start
```

### 2. Execute Automated Newman Tests

Run the full collection against the local environment:

```bash
npm run test:api
```

Or using Newman directly:
```bash
npx newman run postman/collections/backend-api.postman_collection.json -e postman/environments/local.postman_environment.json
```
