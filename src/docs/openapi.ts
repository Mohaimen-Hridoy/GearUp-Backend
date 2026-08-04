export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "GearUp API",
    version: "1.0.0",
    description:
      "Backend API for renting sports & outdoor gear. There are 3 roles: CUSTOMER, PROVIDER, ADMIN. All errors are returned as { success: false, message, errorDetails }.",
  },
  servers: [{ url: "/api" }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user (customer or provider)",
        requestBody: {
          example: {
            name: "Rahim Uddin",
            email: "rahim@example.com",
            password: "12345678",
            role: "CUSTOMER",
          },
        },
        responses: {
          "201": { description: "User created, returns JWT token + user info" },
          "400": { description: "Validation error" },
          "409": { description: "Email already used" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login with email and password",
        requestBody: {
          example: { email: "rahim@example.com", password: "12345678" },
        },
        responses: {
          "200": { description: "Returns JWT token + user info" },
          "401": { description: "Wrong email or password" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get logged-in user's own info",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Current user" } },
      },
    },

    "/categories": {
      get: {
        summary: "Get all gear categories (public)",
        responses: { "200": { description: "List of categories" } },
      },
      post: {
        summary: "Create a category (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: { example: { name: "Camping", slug: "camping" } },
        responses: { "201": { description: "Category created" } },
      },
    },

    "/gear": {
      get: {
        summary: "Get all gear, can filter by category/brand/price (public)",
        responses: { "200": { description: "List of gear items" } },
      },
      post: {
        summary: "Add new gear (provider only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          example: {
            title: "Camping Tent",
            brand: "Decathlon",
            categoryId: "some-category-id",
            pricePerDay: 250,
            stock: 5,
          },
        },
        responses: { "201": { description: "Gear created" } },
      },
    },
    "/gear/{id}": {
      get: {
        summary: "Get one gear item by id",
        responses: { "200": { description: "Gear details" }, "404": { description: "Not found" } },
      },
      put: {
        summary: "Update gear (only the provider who owns it)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Gear updated" } },
      },
      delete: {
        summary: "Delete gear (only the provider who owns it)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Gear deleted" } },
      },
    },
    "/provider/gear": {
      get: { summary: "Same as GET /gear (provider-facing alias)", responses: { "200": { description: "List of gear" } } },
      post: { summary: "Same as POST /gear", security: [{ bearerAuth: [] }], responses: { "201": { description: "Gear created" } } },
    },
    "/provider/gear/{id}": {
      get: { summary: "Same as GET /gear/{id}", responses: { "200": { description: "Gear details" } } },
      put: { summary: "Same as PUT /gear/{id}", security: [{ bearerAuth: [] }], responses: { "200": { description: "Gear updated" } } },
      delete: { summary: "Same as DELETE /gear/{id}", security: [{ bearerAuth: [] }], responses: { "200": { description: "Gear deleted" } } },
    },

    "/rentals": {
      get: {
        summary: "Get rental orders (customer sees own, provider sees theirs, admin sees all)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "List of rental orders" } },
      },
      post: {
        summary: "Create a rental order (customer only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          example: {
            gearItemId: "some-gear-id",
            startDate: "2026-07-12T10:00:00.000Z",
            endDate: "2026-07-15T10:00:00.000Z",
          },
        },
        responses: { "201": { description: "Rental order created" } },
      },
    },
    "/rentals/{id}": {
      get: { summary: "Get one rental order by id", security: [{ bearerAuth: [] }], responses: { "200": { description: "Rental order details" } } },
      patch: {
        summary: "Update rental order status (provider who owns the gear)",
        security: [{ bearerAuth: [] }],
        requestBody: { example: { status: "CONFIRMED" } },
        responses: { "200": { description: "Status updated" } },
      },
    },
    "/provider/orders": {
      get: { summary: "Same as GET /rentals", security: [{ bearerAuth: [] }], responses: { "200": { description: "List of rental orders" } } },
    },
    "/provider/orders/{id}": {
      get: { summary: "Same as GET /rentals/{id}", security: [{ bearerAuth: [] }], responses: { "200": { description: "Rental order details" } } },
      patch: { summary: "Same as PATCH /rentals/{id}", security: [{ bearerAuth: [] }], responses: { "200": { description: "Status updated" } } },
    },

    "/payments/create": {
      post: {
        summary: "Create a Stripe payment for a rental order (customer only)",
        security: [{ bearerAuth: [] }],
        requestBody: { example: { rentalOrderId: "some-rental-id" } },
        responses: {
          "201": { description: "Payment created, returns Stripe clientSecret" },
          "500": { description: "Stripe is not configured on the server" },
        },
      },
    },
    "/payments/confirm": {
      post: {
        summary: "Confirm a Stripe payment and mark the order as PAID",
        security: [{ bearerAuth: [] }],
        requestBody: { example: { rentalOrderId: "some-rental-id", paymentIntentId: "pi_xxx" } },
        responses: { "200": { description: "Payment confirmed" }, "400": { description: "Payment not successful yet" } },
      },
    },
    "/payments": {
      get: {
        summary: "Get payment history",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "List of payments" } },
      },
    },
    "/payments/{id}": {
      get: { summary: "Get one payment by id", security: [{ bearerAuth: [] }], responses: { "200": { description: "Payment details" } } },
    },

    "/reviews": {
      post: {
        summary: "Leave a review for gear you've returned (customer only)",
        security: [{ bearerAuth: [] }],
        requestBody: { example: { gearItemId: "some-gear-id", rating: 5, comment: "Very good gear" } },
        responses: { "201": { description: "Review created" }, "400": { description: "You haven't returned this gear yet" } },
      },
    },

    "/admin/users": {
      get: { summary: "Get all users (admin only)", security: [{ bearerAuth: [] }], responses: { "200": { description: "List of users" } } },
    },
    "/admin/users/{id}": {
      patch: {
        summary: "Suspend or activate a user (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: { example: { status: "SUSPENDED" } },
        responses: { "200": { description: "User status updated" } },
      },
    },
    "/admin/gear": {
      get: { summary: "Get all gear listings (admin only)", security: [{ bearerAuth: [] }], responses: { "200": { description: "List of gear" } } },
    },
    "/admin/rentals": {
      get: { summary: "Get all rental orders (admin only)", security: [{ bearerAuth: [] }], responses: { "200": { description: "List of rental orders" } } },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
} as const;