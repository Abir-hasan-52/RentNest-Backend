# 🏠 RentNest Backend API

<div align="center">

# RentNest

### A Secure & Scalable Rental Property Management Backend API

Built with **Node.js**, **Express.js**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Stripe Payment Gateway**.

![Node.js](https://img.shields.io/badge/Node.js-22+-green?style=for-the-badge\&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge\&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge\&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge\&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge\&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?style=for-the-badge\&logo=stripe)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge\&logo=jsonwebtokens)

</div>

---

# 📖 Project Overview

RentNest is a modern rental property management platform where landlords can publish rental properties, tenants can browse and request rentals, and administrators manage the entire system.

The backend follows a modular architecture with secure authentication, role-based authorization, Stripe payment integration, review management, and analytics dashboards.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

* JWT Authentication
* Role Based Authorization
* Secure Password Hashing (bcrypt)
* Refresh Token
* Protected Routes

---

## 👤 User Management

* User Registration
* User Login
* View Profile
* Update Profile

---

## 👨‍💼 Admin Module

* Category Management
* Landlord Approval System
* Dashboard Analytics
* Revenue Statistics
* User Statistics
* Property Statistics

---

## 🏠 Landlord Module

* Create Property
* Update Property
* Delete Property
* Manage Rental Requests
* Approve Rental Request
* Reject Rental Request
* Automatically Reject Other Pending Requests
* Complete Rental
* Dashboard Analytics

---

## 🏡 Tenant Module

* Browse Properties
* Send Rental Request
* Stripe Payment
* Payment History
* Review Property
* Dashboard Analytics

---

## 💳 Payment Module

* Stripe Checkout Session
* Stripe Webhook
* Payment Verification
* Payment History

---

## ⭐ Review Module

* Create Review
* View Own Reviews
* View Property Reviews
* Average Rating Calculation

---

## 📊 Dashboard Analytics

### Admin Dashboard

* User Statistics
* Property Statistics
* Rental Statistics
* Revenue Statistics
* Monthly Revenue
* Top Properties
* Recent Payments
* Recent Rentals

### Landlord Dashboard

* Property Statistics
* Revenue Analytics
* Revenue Trend
* Top Performing Properties
* Recent Rental Requests
* Recent Reviews
* Recent Payments

### Tenant Dashboard

* Rental Statistics
* Payment Statistics
* Spending Trend
* Recent Rentals
* Recent Reviews
* Recent Payments

---

# 🛠️ Technology Stack

| Category         | Technology |
| ---------------- | ---------- |
| Runtime          | Node.js    |
| Framework        | Express.js |
| Language         | TypeScript |
| Database         | PostgreSQL |
| ORM              | Prisma     |
| Authentication   | JWT        |
| Password Hashing | bcrypt     |
| Payment          | Stripe     |
| Deployment       | Vercel     |

---

# 📁 Project Structure

```text
src
│
├── config
├── generated
├── lib
├── middlewares
├── modules
│   ├── auth
│   ├── user
│   ├── admin
│   ├── landlordProperty
│   ├── PublicProperty
│   ├── rentelRequest_Tenant
│   ├── landlord_rentalRequest
│   ├── payment
│   ├── review
│   ├── adminDashboard
│   ├── landlordDashboard
│   └── tenantDashboard
│
├── routes
├── utils
├── errors
├── app.ts
└── server.ts
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone [https://github.com/your-username/rentnest-backend.git](https://github.com/Abir-hasan-52/RentNest-Backend )
```

---

## Move to Project

```bash
cd rentnest-backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Migration

```bash
npx prisma migrate dev
```

---

## Start Development Server

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file.

```env
DATABASE_URL=

DIRECT_URL=

PORT=5000

NODE_ENV=development

JWT_ACCESS_SECRET=

JWT_ACCESS_EXPIRES_IN=1d

JWT_REFRESH_SECRET=

JWT_REFRESH_EXPIRES_IN=365d

BCRYPT_SALT_ROUNDS=10

APP_URL=http://localhost:3000

EXCHANGE_RATE_USD_TO_BDT=123

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET_KEY=
```

---

# 🗄 Database

Database used:

* PostgreSQL

ORM:

* Prisma ORM

Generate Prisma Client

```bash
npx prisma generate
```

Apply Migration

```bash
npx prisma migrate dev
```

Open Prisma Studio

```bash
npx prisma studio
```

---

# 🔒 Authentication

RentNest uses JWT Authentication.

Protected routes require an Access Token.

Example:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

# 💳 Stripe Payment

The project integrates Stripe Checkout.

Payment Flow

```text
Tenant

↓

Create Checkout Session

↓

Stripe Checkout

↓

Payment Success

↓

Webhook

↓

Payment Status Updated

↓

Rental Activated
```

Stripe Test Card

```text
Card Number : 4242 4242 4242 4242

Expiry Date : Any Future Date

CVC : Any 3 Digits

ZIP : Any Value
```

---

# 📚 API Documentation

Official Postman Documentation

https://documenter.getpostman.com/view/54800967/2sBY4LS2dq

The API documentation includes:

* Authentication
* Request Body
* Query Parameters
* Sample Responses
* Error Responses
* Authorization Requirements

---

# 🚀 Deployment

Backend Deployment

* Vercel

Database

* PostgreSQL

Payment Gateway

* Stripe
# 📌 API Overview

## Authentication APIs

| Method | Endpoint                  | Access             | Description               |
| ------ | ------------------------- | ------------------ | ------------------------- |
| POST   | `/api/auth/login`         | Public             | Login user                |
| POST   | `/api/auth/refresh-token` | Public             | Generate new access token |
| POST   | `/api/auth/logout`        | Authenticated User | Logout user               |

---

## User APIs

| Method | Endpoint             | Access | Description         |
| ------ | -------------------- | ------ | ------------------- |
| POST   | `/api/user/register` | Public | Register a new user |
| GET    | `/api/user/profile`  | User   | Get own profile     |
| PATCH  | `/api/user/profile`  | User   | Update own profile  |

---

## Category APIs

| Method | Endpoint                    | Access | Description        |
| ------ | --------------------------- | ------ | ------------------ |
| POST   | `/api/admin/categories`     | Admin  | Create category    |
| GET    | `/api/admin/categories`     | Public | Get all categories |
| PATCH  | `/api/admin/categories/:id` | Admin  | Update category    |
| DELETE | `/api/admin/categories/:id` | Admin  | Delete category    |

---

## Landlord Request APIs

| Method | Endpoint                           | Access | Description                        |
| ------ | ---------------------------------- | ------ | ---------------------------------- |
| GET    | `/api/admin/landlord-requests`     | Admin  | Get all landlord requests          |
| GET    | `/api/admin/landlord-requests/:id` | Admin  | Get landlord request details       |
| PATCH  | `/api/admin/landlord-requests/:id` | Admin  | Approve or reject landlord request |

---

## Property APIs

| Method | Endpoint                       | Access   | Description          |
| ------ | ------------------------------ | -------- | -------------------- |
| POST   | `/api/landlord/properties`     | Landlord | Create a property    |
| GET    | `/api/landlord/properties`     | Landlord | Get own properties   |
| GET    | `/api/landlord/properties/:id` | Landlord | Get property details |
| PATCH  | `/api/landlord/properties/:id` | Landlord | Update property      |
| DELETE | `/api/landlord/properties/:id` | Landlord | Delete property      |

---

## Public Property APIs

| Method | Endpoint                             | Access | Description                          |
| ------ | ------------------------------------ | ------ | ------------------------------------ |
| GET    | `/api/public/properties`             | Public | Browse all available properties      |
| GET    | `/api/public/properties/:id`         | Public | Property details                     |
| GET    | `/api/public/properties/:id/reviews` | Public | Property reviews with average rating |

---

## Rental Request APIs

| Method | Endpoint           | Access | Description             |
| ------ | ------------------ | ------ | ----------------------- |
| POST   | `/api/rentals`     | Tenant | Create rental request   |
| GET    | `/api/rentals`     | Tenant | Get own rental requests |
| GET    | `/api/rentals/:id` | Tenant | Rental request details  |

---

## Landlord Rental Management APIs

| Method | Endpoint                             | Access   | Description                      |
| ------ | ------------------------------------ | -------- | -------------------------------- |
| GET    | `/api/landlord/rental-requests`      | Landlord | Get all rental requests          |
| GET    | `/api/landlord/rental-requests/:id`  | Landlord | Rental request details           |
| PATCH  | `/api/landlord/rental-requests/:id`  | Landlord | Approve or reject rental request |
| PATCH  | `/api/landlord/rentals/:id/complete` | Landlord | Mark rental as completed         |

---

## Payment APIs

| Method | Endpoint                | Access | Description                    |
| ------ | ----------------------- | ------ | ------------------------------ |
| POST   | `/api/payments/create`  | Tenant | Create Stripe Checkout Session |
| POST   | `/api/payments/webhook` | Stripe | Stripe webhook                 |
| GET    | `/api/payments`         | Tenant | Payment history                |
| GET    | `/api/payments/:id`     | Tenant | Payment details                |

---

## Review APIs

| Method | Endpoint          | Access | Description     |
| ------ | ----------------- | ------ | --------------- |
| POST   | `/api/reviews`    | Tenant | Create review   |
| GET    | `/api/reviews/my` | Tenant | Get own reviews |

---

## Dashboard APIs

### Admin Dashboard

| Method | Endpoint               | Access | Description                         |
| ------ | ---------------------- | ------ | ----------------------------------- |
| GET    | `/api/admin/dashboard` | Admin  | Complete system analytics dashboard |

---

### Landlord Dashboard

| Method | Endpoint                  | Access   | Description                              |
| ------ | ------------------------- | -------- | ---------------------------------------- |
| GET    | `/api/landlord/dashboard` | Landlord | Property and revenue analytics dashboard |

---

### Tenant Dashboard

| Method | Endpoint                | Access | Description                  |
| ------ | ----------------------- | ------ | ---------------------------- |
| GET    | `/api/tenant/dashboard` | Tenant | Rental and payment dashboard |

---

# 📊 API Statistics

| Module                     |  Total APIs |
| -------------------------- | ----------: |
| Authentication             |           3 |
| User                       |           3 |
| Category                   |           4 |
| Landlord Request           |           3 |
| Property                   |           5 |
| Public Property            |           3 |
| Rental Request             |           3 |
| Landlord Rental Management |           4 |
| Payment                    |           4 |
| Review                     |           2 |
| Dashboard                  |           3 |
| **Total**                  | **37 APIs** |

---

# 🏗 Business Workflow

```text
Register
      │
      ▼
Login
      │
      ▼
Landlord Creates Property
      │
      ▼
Tenant Browses Properties
      │
      ▼
Tenant Sends Rental Request
      │
      ▼
Landlord Approves Request
      │
      ▼
Stripe Payment
      │
      ▼
Webhook Updates Payment Status
      │
      ▼
Rental Becomes ACTIVE
      │
      ▼
Landlord Completes Rental
      │
      ▼
Tenant Leaves Review
```

---

# 📊 Dashboard Analytics

## Admin Dashboard

* Total Users
* Total Landlords
* Total Tenants
* Total Properties
* Available Properties
* Rented Properties
* Rental Statistics
* Revenue Statistics
* Monthly Revenue
* Revenue Trend
* Review Statistics
* Top Reviewed Properties
* Highest Rated Properties
* Recent Rental Requests
* Recent Payments

---

## Landlord Dashboard

* Property Statistics
* Rental Statistics
* Revenue Analytics
* Monthly Revenue
* Revenue Trend
* Top Performing Properties
* Recent Rental Requests
* Recent Payments
* Recent Reviews

---

## Tenant Dashboard

* Rental Statistics
* Payment Statistics
* Monthly Spending
* Spending Trend
* Recent Rentals
* Recent Payments
* Recent Reviews

---

# 🔒 Security Features

* JWT Authentication
* Role-Based Authorization
* Password Hashing using bcrypt
* HTTP Only Cookies
* Input Validation using Zod
* Prisma ORM
* Global Error Handling
* Secure Stripe Payment

---

# 📖 Postman Documentation

Complete API Documentation

https://documenter.getpostman.com/view/54800967/2sBY4LS2dq

---

# 🚀 Future Improvements

* Email Notifications
* Property Wishlist
* Property Images (Cloudinary)
* Chat Between Landlord & Tenant
* Rental Extension Requests
* Admin Notification Center
* Property View Analytics
* Multi Payment Gateway Support (SSLCommerz)

---

# 👨‍💻 Author

**Abir Hasan**

GitHub: https://github.com/Abir-hasan-52

---

# 🙏 Acknowledgements

Special thanks to:

* Node.js
* Express.js
* Prisma
* PostgreSQL
* Stripe
* Vercel

---

# 📄 License

This project was developed for educational and portfolio purposes.

© 2026 Abir Hasan. All rights reserved.
