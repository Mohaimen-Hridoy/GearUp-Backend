# GearUp Backend API

A backend REST API for the GearUp equipment rental platform. This project allows customers to rent gear, providers to manage their equipment, and admins to manage the overall system. It is built with Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT authentication, and Stripe payment integration.

---

## Features

- User Authentication using JWT
- Role-based Authorization (Admin, Provider, Customer)
- Category Management
- Gear Management
- Rental Order Management
- Stripe Payment Integration
- Review System
- OpenAPI Documentation
- Structured Error Responses
- Input Validation
- Prisma ORM with PostgreSQL

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Stripe
- Zod
- Vercel

---

## Live API

```
https://gear-up-eta.vercel.app
```

---

## GitHub Repository

```
https://github.com/Mohaimen-Hridoy/GearUp
```

---

## API Documentation

Published Postman documentation (public link):

```
https://documenter.getpostman.com/view/55052230/2sBY4Mw2SS
```

OpenAPI specification (served live):

```
https://gear-up-eta.vercel.app/api/docs
```

Postman collection (importable) is also included in the repo at:

```
postman/GearUp.postman_collection.json
```

Import it into Postman, then run `Auth > Login (Admin)` first — the JWT token is
saved automatically and reused by every protected request.

---

## Demo Video

```
https://drive.google.com/file/d/17jyF8AiKWMRa5EbDgcMsfKpkF2pIxFz9/view?usp=sharing
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/Mohaimen-Hridoy/GearUp.git
```

Install dependencies

```bash
npm install
```

Create a `.env` file and configure the required environment variables.

Generate Prisma Client

```bash
npm run prisma:generate
```

Run migrations

```bash
npm run prisma:migrate
```

Seed the database

```bash
npm run prisma:seed
```

Start the development server

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file using `.env.example`.

Required variables:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/gearup
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=
PAYMENT_PROVIDER=stripe
ADMIN_EMAIL=admin@gearup.com
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=GearUp Admin
```

---

## Admin Credentials

Email

```
admin@gearup.com
```

Password

```
Admin@12345
```

---

## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Categories

- GET /api/categories
- POST /api/categories

### Gear

- GET /api/gear
- GET /api/gear/:id
- POST /api/provider/gear
- PUT /api/provider/gear/:id
- DELETE /api/provider/gear/:id

### Rentals

- POST /api/rentals
- GET /api/rentals
- GET /api/rentals/:id
- GET /api/provider/orders
- PATCH /api/provider/orders/:id

### Payments

- POST /api/payments/create
- POST /api/payments/confirm
- GET /api/payments
- GET /api/payments/:id

### Reviews

- POST /api/reviews

### Admin

- GET /api/admin/users
- PATCH /api/admin/users/:id
- GET /api/admin/gear
- GET /api/admin/rentals

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errorDetails": []
}
```

---

## Deployment

The backend is deployed on Vercel.

---

## Author

Mohaimen Hridoy

CSE, MIST (Batch 23)