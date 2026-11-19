# ShopEasy

A full-stack online store built with **MongoDB, Express, React and Node.js**. Customers can browse products, keep a cart, sign up, and place Cash on Delivery orders. Admins manage the catalog and orders from a dashboard.

## Features

**Shopping**
- Quick-commerce style storefront: header search, category tab bar, auto-scrolling offer banners, "Shop by Category" grid and a product row per category
- 180 sample products in 10 categories, priced in Indian Rupees (₹)
- Product catalog with search, category filter and price sorting
- Product detail page with live stock information
- Cart saved in the browser, so it survives a page refresh
- Checkout with shipping address (Cash on Delivery)
- "My Orders" page showing each order's status

**Accounts**
- Register and log in with JWT authentication
- Passwords hashed with bcrypt
- Admin-only routes protected on both the client and the server

**Admin dashboard**
- Add, edit and delete products
- View all orders and change their status (Pending → Shipped → Delivered, or Cancelled)
- Revenue stats

**Server-side safety**
- Order prices are read from the database, never trusted from the client
- Stock is checked and reduced when an order is placed
- Stock is returned when an order is cancelled

## Tech stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | React 18, React Router 6, Vite 5            |
| Backend  | Node.js, Express 4                          |
| Database | MongoDB with Mongoose 8                     |
| Auth     | JSON Web Tokens (jsonwebtoken), bcryptjs    |

## Getting started

### Prerequisites
- Node.js 18 or newer
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Setup

```bash
git clone https://github.com/Nagesh-max999/shopeasy.git
cd shopeasy

npm install            # root tool (concurrently)
npm run install-all    # server + client dependencies
```

Create the server config from the example:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

| Variable     | Description                                              |
|--------------|----------------------------------------------------------|
| `PORT`       | API port (default `5050`)                                |
| `MONGO_URI`  | MongoDB connection string (local or Atlas)               |
| `JWT_SECRET` | A long random string (16+ characters) used to sign login tokens |
| `ADMIN_EMAIL` | Email for the admin account created by `npm run seed`   |
| `ADMIN_PASSWORD` | Password for that admin account (8+ characters)      |

### Run

```bash
npm run seed   # load sample products and demo users (wipes the shop database)
npm run dev    # API on http://localhost:5050, website on http://localhost:3000
```

### Demo account (created by `npm run seed`)

| Role | Email           | Password  |
|------|-----------------|-----------|
| User | `user@shop.com` | `user123` |

The seed script also creates an admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`.

## Deploy

In production the Express server also serves the built React site, so the whole store runs as **one Node service** on one URL.

| Command         | What it does                                              |
|-----------------|-----------------------------------------------------------|
| `npm run build` | Installs server + client dependencies and builds `client/dist` |
| `npm start`     | Starts the server (API + website) on `$PORT`              |

Any Node host works (Railway, Render, Fly.io, a VPS). Set these environment variables on the host:

- `MONGO_URI` (or `MONGO_URL`): a MongoDB connection string, e.g. from MongoDB Atlas or the host's MongoDB add-on
- `JWT_SECRET`: a long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: only needed when running the seed

Then run the seed once against the production database to load the catalog and create the admin account.

## API overview

| Method | Endpoint                  | Access | Description                     |
|--------|---------------------------|--------|---------------------------------|
| POST   | `/api/auth/register`      | Public | Create an account               |
| POST   | `/api/auth/login`         | Public | Log in, returns a JWT           |
| GET    | `/api/auth/me`            | User   | Current user                    |
| GET    | `/api/products`           | Public | List products (search, filter, sort) |
| GET    | `/api/products/categories`| Public | List categories                 |
| GET    | `/api/products/:id`       | Public | Product details                 |
| POST   | `/api/products`           | Admin  | Create a product                |
| PUT    | `/api/products/:id`       | Admin  | Update a product                |
| DELETE | `/api/products/:id`       | Admin  | Delete a product                |
| POST   | `/api/orders`             | User   | Place an order                  |
| GET    | `/api/orders/mine`        | User   | Your orders                     |
| GET    | `/api/orders`             | Admin  | All orders                      |
| PUT    | `/api/orders/:id/status`  | Admin  | Change an order's status        |

Send the token as `Authorization: Bearer <token>` for protected routes.

## Project structure

```
shopeasy/
├── client/              React frontend (Vite)
│   └── src/
│       ├── components/  Navbar, Footer, ProductCard, ...
│       ├── context/     Auth, Cart and Toast state
│       └── pages/       Home, Product, Cart, Checkout, Orders, Admin, ...
└── server/              Express API
    ├── middleware/      JWT auth and admin checks
    ├── models/          User, Product, Order (Mongoose)
    ├── routes/          auth, products, orders
    ├── data/            products.json (sample catalog)
    └── seed.js          Sample data loader
```

Sample product names, descriptions and photos come from [DummyJSON](https://dummyjson.com). Photos are loaded from its CDN, so they need an internet connection.

## Troubleshooting

**The API keeps restarting when the project is inside OneDrive or Dropbox.**
`npm run dev` starts the API with `node --watch`, and folder sync tools touch files in `node_modules`, which looks like a code change. Either move the project outside the synced folder, or start the API without watching:

```bash
npm start --prefix server
```
