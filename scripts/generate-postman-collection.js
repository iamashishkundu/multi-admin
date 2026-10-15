const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    _postman_id: "7b4c9e10-6192-4f34-8f23-911a2f60e901",
    name: "Role-Based Backend API Test Suite",
    description: "Automated test suite verifying dynamic module permissions, RBAC, financial consistency, and module operations.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: []
};

function reqItem({ name, method, path, headers = [], body = null, preRequest = null, testScript = null, authType = 'bearer', tokenVar = null }) {
  const reqHeaders = [...headers];
  if (tokenVar) {
    reqHeaders.push({
      key: "Authorization",
      value: `Bearer {{${tokenVar}}}`,
      type: "text"
    });
  }
  if (body) {
    reqHeaders.push({
      key: "Content-Type",
      value: "application/json",
      type: "text"
    });
  }

  const events = [];
  if (preRequest) {
    events.push({
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: Array.isArray(preRequest) ? preRequest : preRequest.split('\n')
      }
    });
  }
  if (testScript) {
    events.push({
      listen: "test",
      script: {
        type: "text/javascript",
        exec: Array.isArray(testScript) ? testScript : testScript.split('\n')
      }
    });
  }

  const request = {
    method,
    header: reqHeaders,
    url: {
      raw: `{{baseUrl}}${path}`,
      host: ["{{baseUrl}}"],
      path: path.split('/').filter(Boolean)
    }
  };

  if (body) {
    request.body = {
      mode: "raw",
      raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  return {
    name,
    event: events,
    request
  };
}

// 1. Health Check Folder
const healthCheckFolder = {
  name: "1. Health Check",
  item: [
    reqItem({
      name: "API Health Status",
      method: "GET",
      path: "/health",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("API is operational", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.message).to.include("healthy");
});
`
    })
  ]
};

// 2. Authentication Folder
const authFolder = {
  name: "2. Authentication",
  item: [
    reqItem({
      name: "Register Normal User",
      method: "POST",
      path: "/auth/register",
      preRequest: `
var uniqueEmail = "user_" + Date.now() + "@test.com";
pm.environment.set("testUserEmail", uniqueEmail);
`,
      body: {
        name: "Test User",
        email: "{{testUserEmail}}",
        password: "UserPassword!123"
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("User registered and token returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property("token");
    pm.expect(jsonData.data.user.role).to.eql("user");
    pm.expect(jsonData.data.user).to.not.have.property("passwordHash");
    pm.environment.set("userToken", jsonData.data.token);
    pm.environment.set("userId", jsonData.data.user.id);
});
`
    }),
    reqItem({
      name: "Login Normal User",
      method: "POST",
      path: "/auth/login",
      body: {
        email: "{{testUserEmail}}",
        password: "UserPassword!123"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Login successful and token returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property("token");
    pm.environment.set("userToken", jsonData.data.token);
});
`
    }),
    reqItem({
      name: "Login Admin",
      method: "POST",
      path: "/auth/login",
      body: {
        email: "{{adminEmail}}",
        password: "{{adminPassword}}"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Admin login successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.user.role).to.eql("admin");
    pm.expect(jsonData.data.user).to.not.have.property("passwordHash");
    pm.environment.set("adminToken", jsonData.data.token);
});
`
    }),
    reqItem({
      name: "Login with Invalid Password -> 401",
      method: "POST",
      path: "/auth/login",
      body: {
        email: "{{adminEmail}}",
        password: "WrongPassword!999"
      },
      testScript: `
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code is INVALID_CREDENTIALS", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("INVALID_CREDENTIALS");
});
`
    }),
    reqItem({
      name: "Login with Unknown Email -> 401",
      method: "POST",
      path: "/auth/login",
      body: {
        email: "nonexistent_email_12345@test.com",
        password: "SomePassword!123"
      },
      testScript: `
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code is INVALID_CREDENTIALS", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("INVALID_CREDENTIALS");
});
`
    }),
    reqItem({
      name: "Access Protected Endpoint Without Token -> 401",
      method: "GET",
      path: "/user/profile",
      testScript: `
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code indicates TOKEN_REQUIRED", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("TOKEN_REQUIRED");
});
`
    }),
    reqItem({
      name: "Access Protected Endpoint with Malformed Token -> 401",
      method: "GET",
      path: "/user/profile",
      headers: [{ key: "Authorization", value: "Bearer invalid.malformed.jwt.token", type: "text" }],
      testScript: `
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code indicates INVALID_TOKEN", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("INVALID_TOKEN");
});
`
    })
  ]
};

// 3. User Management Folder
const userFolder = {
  name: "3. User Management",
  item: [
    reqItem({
      name: "Get User Profile",
      method: "GET",
      path: "/user/profile",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Returns user profile without passwordHash", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.email).to.eql(pm.environment.get("testUserEmail"));
    pm.expect(jsonData.data).to.not.have.property("passwordHash");
});
`
    }),
    reqItem({
      name: "Update User Profile",
      method: "PATCH",
      path: "/user/profile",
      tokenVar: "userToken",
      body: {
        name: "Updated Test User Name"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Profile name updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.name).to.eql("Updated Test User Name");
});
`
    }),
    reqItem({
      name: "Admin List Users (Paginated)",
      method: "GET",
      path: "/admin/users?page=1&limit=10",
      tokenVar: "adminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Returns paginated users", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.be.an("array");
    pm.expect(jsonData).to.have.property("pagination");
});
`
    })
  ]
};

// 4. Admin Management Folder
const adminFolder = {
  name: "4. Admin Management",
  item: [
    reqItem({
      name: "Admin View Audit Logs",
      method: "GET",
      path: "/admin/audit-logs?limit=5",
      tokenVar: "adminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Audit logs returned with pagination", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.be.an("array");
});
`
    }),
    reqItem({
      name: "Normal User Cannot Access Audit Logs -> 403",
      method: "GET",
      path: "/admin/audit-logs",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
pm.test("Access denied error code", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");
});
`
    })
  ]
};

// 5. Sub-admin Management Folder
const subadminFolder = {
  name: "5. Sub-admin Management",
  item: [
    reqItem({
      name: "Admin Create Sub-admin",
      method: "POST",
      path: "/subadmins",
      tokenVar: "adminToken",
      preRequest: `
var subEmail = "subadmin_" + Date.now() + "@test.com";
pm.environment.set("testSubAdminEmail", subEmail);
`,
      body: {
        name: "Test Sub-Admin",
        email: "{{testSubAdminEmail}}",
        password: "SubAdminPassword!123"
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Sub-admin account created with role subadmin", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.role).to.eql("subadmin");
    pm.expect(jsonData.data).to.not.have.property("passwordHash");
    pm.environment.set("subadminId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Login Sub-admin",
      method: "POST",
      path: "/auth/login",
      body: {
        email: "{{testSubAdminEmail}}",
        password: "SubAdminPassword!123"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Sub-admin token captured", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.user.role).to.eql("subadmin");
    pm.environment.set("subadminToken", jsonData.data.token);
});
`
    }),
    reqItem({
      name: "Normal User Cannot Access Sub-admin APIs -> 403",
      method: "GET",
      path: "/subadmins",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
`
    }),
    reqItem({
      name: "Sub-admin Cannot Create Another Sub-admin -> 403",
      method: "POST",
      path: "/subadmins",
      tokenVar: "subadminToken",
      body: {
        name: "Illegal Subadmin",
        email: "illegal@test.com",
        password: "Password!123"
      },
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
pm.test("Error is FORBIDDEN", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");
});
`
    })
  ]
};

// 6. Dynamic Permission Workflow (End-to-End Sequence)
const dynamicWorkflowFolder = {
  name: "6. Permission Assignment & Dynamic Workflow",
  item: [
    reqItem({
      name: "Prerequisite: Admin Creates Inventory Item for Workflow",
      method: "POST",
      path: "/inventory",
      tokenVar: "adminToken",
      preRequest: `
var sku = "WF-SKU-" + Date.now();
pm.environment.set("wfSku", sku);
`,
      body: {
        sku: "{{wfSku}}",
        name: "Workflow Test Product",
        stockQuantity: 100,
        unitPrice: 49.99
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Prerequisite inventory item created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.environment.set("inventoryId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Step 1: Admin Assigns orders.read Permission",
      method: "POST",
      path: "/permissions/assign",
      tokenVar: "adminToken",
      body: {
        subadminId: "{{subadminId}}",
        permissions: [
          {
            module: "orders",
            actions: ["read"]
          }
        ]
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("orders.read assigned successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
`
    }),
    reqItem({
      name: "Step 2: Sub-admin Reads Orders -> 200 OK",
      method: "GET",
      path: "/orders",
      tokenVar: "subadminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Sub-admin successfully reads orders", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
`
    }),
    reqItem({
      name: "Step 3: Sub-admin Attempts to Create Order Without Permission -> 403 Forbidden",
      method: "POST",
      path: "/orders",
      tokenVar: "subadminToken",
      body: {
        items: [
          {
            inventoryId: "{{inventoryId}}",
            quantity: 1
          }
        ]
      },
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
pm.test("Error indicates missing orders.create permission", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");
});
`
    }),
    reqItem({
      name: "Step 4: Admin Grants orders.create Permission to Sub-admin",
      method: "POST",
      path: "/permissions/assign",
      tokenVar: "adminToken",
      body: {
        subadminId: "{{subadminId}}",
        permissions: [
          {
            module: "orders",
            actions: ["create"]
          }
        ]
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
`
    }),
    reqItem({
      name: "Step 5: Sub-admin Creates Order with New Permission -> 201 Created",
      method: "POST",
      path: "/orders",
      tokenVar: "subadminToken",
      body: {
        items: [
          {
            inventoryId: "{{inventoryId}}",
            quantity: 1
          }
        ]
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Order created by authorized sub-admin", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property("orderNumber");
    pm.environment.set("testOrderId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Step 6: Admin Revokes orders.create Permission from Sub-admin",
      method: "POST",
      path: "/permissions/revoke",
      tokenVar: "adminToken",
      body: {
        subadminId: "{{subadminId}}",
        permissions: [
          {
            module: "orders",
            actions: ["create"]
          }
        ]
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
`
    }),
    reqItem({
      name: "Step 7: Sub-admin Tries Creating Order Immediately -> 403 Forbidden",
      method: "POST",
      path: "/orders",
      tokenVar: "subadminToken",
      body: {
        items: [
          {
            inventoryId: "{{inventoryId}}",
            quantity: 1
          }
        ]
      },
      testScript: `
pm.test("Status code is 403 Forbidden (Immediate Revocation)", function () {
    pm.response.to.have.status(403);
});
pm.test("Access is rejected immediately upon revocation", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");
});
`
    }),
    reqItem({
      name: "Step 8: Sub-admin Cannot Assign Permissions to Themselves -> 403 Forbidden",
      method: "POST",
      path: "/permissions/assign",
      tokenVar: "subadminToken",
      body: {
        subadminId: "{{subadminId}}",
        permissions: [{ module: "orders", actions: ["create"] }]
      },
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
`
    })
  ]
};

// 7. Inventory Module Folder
const inventoryFolder = {
  name: "7. Inventory Module",
  item: [
    reqItem({
      name: "Admin Create Inventory Item",
      method: "POST",
      path: "/inventory",
      tokenVar: "adminToken",
      preRequest: `
var sku = "SKU-" + Date.now();
pm.environment.set("testSku", sku);
`,
      body: {
        sku: "{{testSku}}",
        name: "Ergonomic Mechanical Keyboard",
        stockQuantity: 50,
        unitPrice: 129.99
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Inventory item created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.stockQuantity).to.eql(50);
    pm.environment.set("inventoryId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "List Inventory Items",
      method: "GET",
      path: "/inventory",
      tokenVar: "adminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
`
    }),
    reqItem({
      name: "Adjust Stock (Atomic Adjustment)",
      method: "POST",
      path: "/inventory/{{inventoryId}}/adjust-stock",
      tokenVar: "adminToken",
      body: {
        adjustmentQuantity: 10,
        reason: "Supplier batch replenishment"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Stock increased by 10", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.stockQuantity).to.eql(60);
});
`
    }),
    reqItem({
      name: "Adjust Stock Resulting in Negative -> 400 Bad Request",
      method: "POST",
      path: "/inventory/{{inventoryId}}/adjust-stock",
      tokenVar: "adminToken",
      body: {
        adjustmentQuantity: -9999,
        reason: "Excessive decrement"
      },
      testScript: `
pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code is INSUFFICIENT_STOCK", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.error.code).to.eql("INSUFFICIENT_STOCK");
});
`
    })
  ]
};

// 8. Orders Module Folder
const ordersFolder = {
  name: "8. Orders Module",
  item: [
    reqItem({
      name: "User Create Order",
      method: "POST",
      path: "/orders",
      tokenVar: "userToken",
      body: {
        items: [
          {
            inventoryId: "{{inventoryId}}",
            quantity: 2
          }
        ]
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Order created with pending status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.status).to.eql("pending");
    pm.environment.set("orderId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Admin Update Order Status",
      method: "PATCH",
      path: "/orders/{{orderId}}/status",
      tokenVar: "adminToken",
      body: {
        status: "processing"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Status transitioned to processing", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.eql("processing");
});
`
    }),
    reqItem({
      name: "Admin Cancel Order and Release Stock",
      method: "POST",
      path: "/orders/{{orderId}}/cancel",
      tokenVar: "adminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Order status is cancelled", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.eql("cancelled");
});
`
    })
  ]
};

// 9. Wallets Module Folder
const walletsFolder = {
  name: "9. Wallets Module",
  item: [
    reqItem({
      name: "Get User's Own Wallet",
      method: "GET",
      path: "/wallets/my-wallet",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Wallet initialized with zero or positive balance", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.balance).to.be.at.least(0);
    pm.environment.set("walletId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Admin Credit Wallet",
      method: "POST",
      path: "/wallets/{{walletId}}/credit",
      tokenVar: "adminToken",
      body: {
        amount: 250.00,
        description: "Promotional credit bonus"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Wallet balance credited", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.wallet.balance).to.be.at.least(250.00);
    pm.expect(jsonData.data.transaction.type).to.eql("deposit");
});
`
    }),
    reqItem({
      name: "Admin Debit Wallet",
      method: "POST",
      path: "/wallets/{{walletId}}/debit",
      tokenVar: "adminToken",
      body: {
        amount: 50.00,
        description: "Platform service fee"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Wallet balance debited", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.transaction.type).to.eql("withdrawal");
    pm.environment.set("transactionId", jsonData.data.transaction.id);
});
`
    }),
    reqItem({
      name: "Debit Exceeding Balance -> 400 Bad Request",
      method: "POST",
      path: "/wallets/{{walletId}}/debit",
      tokenVar: "adminToken",
      body: {
        amount: 999999.00,
        description: "Attempted overdraft"
      },
      testScript: `
pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code is INSUFFICIENT_FUNDS", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.error.code).to.eql("INSUFFICIENT_FUNDS");
});
`
    }),
    reqItem({
      name: "Adjust Wallet Balance",
      method: "POST",
      path: "/wallets/{{walletId}}/adjust",
      tokenVar: "adminToken",
      body: {
        amount: 25.50,
        reason: "Reconciliation correction"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Adjustment recorded", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.transaction.type).to.eql("adjustment");
});
`
    })
  ]
};

// 10. Transactions Module Folder
const transactionsFolder = {
  name: "10. Transactions Module",
  item: [
    reqItem({
      name: "List Transactions (Ledger)",
      method: "GET",
      path: "/transactions",
      tokenVar: "adminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Transactions returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.be.an("array");
});
`
    }),
    reqItem({
      name: "Export Transactions",
      method: "POST",
      path: "/transactions/export",
      tokenVar: "adminToken",
      body: {
        format: "json"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
`
    }),
    reqItem({
      name: "Refund Transaction",
      method: "POST",
      path: "/transactions/{{transactionId}}/refund",
      tokenVar: "adminToken",
      body: {
        reason: "Customer dissatisfaction dispute"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Transaction status updated to refunded", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.originalTransaction.status).to.eql("refunded");
});
`
    })
  ]
};

// 11. Notifications Module Folder
const notificationsFolder = {
  name: "11. Notifications Module",
  item: [
    reqItem({
      name: "Send Broadcast Notification",
      method: "POST",
      path: "/notifications/send",
      tokenVar: "adminToken",
      body: {
        title: "Scheduled Maintenance Announcement",
        message: "System maintenance is scheduled for Sunday at 02:00 UTC.",
        isBroadcast: true
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Broadcast notification sent", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.isBroadcast).to.eql(true);
    pm.environment.set("notificationId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "User List Notifications",
      method: "GET",
      path: "/notifications",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("User receives broadcast notification", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.length).to.be.at.least(1);
});
`
    }),
    reqItem({
      name: "User Mark Notification Read",
      method: "PATCH",
      path: "/notifications/{{notificationId}}/read",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Notification is marked read", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.isRead).to.eql(true);
});
`
    })
  ]
};

// 12. FAQ Module Folder
const faqFolder = {
  name: "12. FAQ Module",
  item: [
    reqItem({
      name: "Admin Create FAQ",
      method: "POST",
      path: "/faqs",
      tokenVar: "adminToken",
      body: {
        question: "How do module permissions work in this platform?",
        answer: "Admins can assign specific module and action permissions dynamically to each Sub-admin.",
        category: "security",
        isPublished: false
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("FAQ created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.isPublished).to.eql(false);
    pm.environment.set("faqId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Admin Publish FAQ",
      method: "PATCH",
      path: "/faqs/{{faqId}}/publish",
      tokenVar: "adminToken",
      body: {
        isPublished: true
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("FAQ published", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.isPublished).to.eql(true);
});
`
    }),
    reqItem({
      name: "Public List Published FAQs",
      method: "GET",
      path: "/faqs",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("All returned FAQs are published", function () {
    var jsonData = pm.response.json();
    jsonData.data.forEach(function(item) {
        pm.expect(item.isPublished).to.eql(true);
    });
});
`
    })
  ]
};

// 13. Settings Module Folder
const settingsFolder = {
  name: "13. Settings Module",
  item: [
    reqItem({
      name: "Admin Update Setting",
      method: "PATCH",
      path: "/settings/max_order_items",
      tokenVar: "adminToken",
      body: {
        value: 100,
        description: "Maximum allowable item quantity per order",
        isPublic: true
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Setting persisted", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.key).to.eql("max_order_items");
    pm.expect(jsonData.data.value).to.eql(100);
});
`
    }),
    reqItem({
      name: "User Read Public Setting",
      method: "GET",
      path: "/settings/max_order_items",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};

// 14. Help Module Folder
const helpFolder = {
  name: "14. Help Module",
  item: [
    reqItem({
      name: "User Submit Help Ticket",
      method: "POST",
      path: "/help",
      tokenVar: "userToken",
      body: {
        subject: "Question about wallet balance reconciliation",
        description: "My latest transaction is showing as completed but I need clarification.",
        priority: "medium"
      },
      testScript: `
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Ticket created with open status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.eql("open");
    pm.environment.set("ticketId", jsonData.data.id);
});
`
    }),
    reqItem({
      name: "Admin Assign Help Ticket to Sub-admin",
      method: "PATCH",
      path: "/help/{{ticketId}}/assign",
      tokenVar: "adminToken",
      body: {
        assignedToId: "{{subadminId}}"
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Ticket assigned and transitioned to in_progress", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.eql("in_progress");
});
`
    }),
    reqItem({
      name: "Admin Resolve Help Ticket",
      method: "PATCH",
      path: "/help/{{ticketId}}/resolve",
      tokenVar: "adminToken",
      body: {
        resolutionNote: "Contacted customer and clarified ledger details. Resolved successfully."
      },
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Ticket resolved", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.eql("resolved");
    pm.expect(jsonData.data.resolutionNote).to.include("Resolved");
});
`
    })
  ]
};

// 15. Authorization & Security Folder
const securityFolder = {
  name: "15. Authorization and Security",
  item: [
    reqItem({
      name: "Normal User Cannot Access Admin Users -> 403",
      method: "GET",
      path: "/admin/users",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
`
    }),
    reqItem({
      name: "Normal User Cannot Access Settings Manage -> 403",
      method: "PATCH",
      path: "/settings/max_order_items",
      tokenVar: "userToken",
      body: {
        value: 9999
      },
      testScript: `
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
`
    }),
    reqItem({
      name: "Deactivate Sub-admin and Verify Immediate Session Invalidation",
      method: "DELETE",
      path: "/subadmins/{{subadminId}}",
      tokenVar: "adminToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Sub-admin is deactivated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.isActive).to.eql(false);
});
`
    }),
    reqItem({
      name: "Deactivated Sub-admin Request Fails -> 403 Forbidden",
      method: "GET",
      path: "/orders",
      tokenVar: "subadminToken",
      testScript: `
pm.test("Status code is 401 or 403 (Session or Account Invalidated)", function () {
    pm.expect(pm.response.code).to.be.oneOf([401, 403]);
});
pm.test("Deactivated user access is immediately blocked", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
});
`
    })
  ]
};

// 16. Cleanup Folder
const cleanupFolder = {
  name: "16. Cleanup",
  item: [
    reqItem({
      name: "Logout User Session",
      method: "POST",
      path: "/auth/logout",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
`
    }),
    reqItem({
      name: "Logged Out User Access Fails Immediately -> 401 Unauthorized",
      method: "GET",
      path: "/user/profile",
      tokenVar: "userToken",
      testScript: `
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Session is invalidated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.error.code).to.eql("SESSION_INVALIDATED");
});
`
    })
  ]
};

collection.item = [
  healthCheckFolder,
  authFolder,
  userFolder,
  adminFolder,
  subadminFolder,
  dynamicWorkflowFolder,
  inventoryFolder,
  ordersFolder,
  walletsFolder,
  transactionsFolder,
  notificationsFolder,
  faqFolder,
  settingsFolder,
  helpFolder,
  securityFolder,
  cleanupFolder
];

const targetDir = path.join(__dirname, '../postman/collections');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, 'backend-api.postman_collection.json');
fs.writeFileSync(targetPath, JSON.stringify(collection, null, 2), 'utf8');
console.log(`Generated Postman collection at: ${targetPath}`);
