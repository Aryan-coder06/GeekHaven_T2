# 🌐 GeekHaven Resale Marketplace

A full-stack **Resale Marketplace** built with **React + TypeScript (Vite)** on the frontend and **Express.js + MongoDB (Mongoose)** on the backend.

Supports **JWT cookie auth**, **buyer & seller profiles**, **listings with search/filters**, **favorites & cart**, **idempotent checkout with HMAC signatures**, and **deployment on Render**.

---

## 📑 Table of Contents
- [✨ Features](#-features)
- [🗂️ Folder Structure](#️-folder-structure)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [⚙️ Tech Stack](#-tech-stack)
- [🔑 Seed Constraints](#-seed-constraints)
- [🚀 Getting Started](#-getting-started)
  1. [Clone Repository](#1-clone-repository)
  2. [Setup Backend](#2-setup-backend)
  3. [Setup Frontend](#3-setup-frontend)
  4. [Running Locally](#4-running-locally)
- [🌍 Deployment](#-deployment)
- [🧪 API Testing](#-api-testing)
- [📘 API Documentation](#-api-documentation)
- [📂 ADR (Architecture Decision Record)](#-adr-architecture-decision-record)
- [📹 Demo Video](#-demo-video)
- [📊 Future Enhancements](#-future-enhancements)

---

## ✨ Features

- ✅ **User Accounts** – Registration, Login, **JWT cookie** auth  
- ✅ **Profile Management** – View/edit profile, **upgrade to Seller**, manage **Seller Profile**  
- ✅ **Marketplace Listings** – CRUD for product listings, images, categories, **filters, search**  
- ✅ **Favorites** – Like/unlike items  
- ✅ **Cart** – Add/remove/update quantities, clear cart  
- ✅ **Checkout** –  
  - Platform fee = `floor(1.7% * subtotal + n)` (**n derived from Assignment Seed**)  
  - **Idempotency** support (no double-charges)  
  - **HMAC-signed** responses with `X-Signature` header  
- ✅ **Seeded Behaviors** – SKU generation, platform fee, theme colors  
- ✅ **Rate Limiting** – `/checkout` **7 requests/min** per IP  
- ✅ **Deployment** – Full stack deployed on **Render** (frontend + backend)

---

## 🗂️ Folder Structure
gh-resale-backend/
├── node_modules/
├── src/
│   ├── __tests__/          # test files
│   ├── config/             # env, app config helpers
│   ├── data/               # seed/sample data
│   ├── db/                 # database connection/setup
│   ├── middlewares/        # auth, rate limit, error handlers, etc.
│   ├── models/             # Mongoose schemas (User, Listing, Cart, ...)
│   ├── modules/            # feature modules (auth, user, ...)
│   ├── routes/             # express routers (listings, cart, checkout, ...)
│   └── utils/              # helpers (seed, hmac, sku, ...)
├── app.js                  # Express app bootstrap
├── server.js               # HTTP server entry
├── .env                    # local environment values
├── .env.example            # sample env file
├── .gitignore
├── package-lock.json
└── package.json


### Frontend
seed-spun-shop-main/
├── node_modules/
├── public/                    # Static assets (favicon, icons)
├── src/
│   ├── components/            # Reusable UI (layout/, marketplace/, ui/…)
│   ├── contexts/              # React Contexts (Auth, Cart, Theme, Log)
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Client helpers (api, constants)
│   ├── pages/                 # Route pages (Browse, Cart, Profile, Checkout)
│   ├── services/              # API clients (account.ts, products.ts, favorites.ts)
│   ├── utils/                 # Seed utils, formatters
│   ├── App.css
│   ├── App.tsx                # Router + layout
│   ├── index.css              # Tailwind + globals
│   ├── main.tsx               # React entry
│   └── vite-env.d.ts          # Vite TS types
├── .env                       # VITE_API_BASE_URL, VITE_ASSIGNMENT_SEED
├── .env.example
├── .gitignore
├── components.json            # shadcn/ui config (if used)
├── eslint.config.js
├── index.html                 # Vite HTML entry
├── package-lock.json
├── package.json
├── postcss.config.js
└── README.md

---

## ⚙️ Tech Stack

### Frontend
- ⚛️ React + **TypeScript (Vite)**
- 🎨 **TailwindCSS** + **ShadCN/UI**
- 📦 **Axios** for API
- 🔐 **Cookie-based Auth** (HTTP-only JWT)

### Backend
- 🟢 **Node.js + Express**
- 🍃 **MongoDB + Mongoose**
- 🛡 **Helmet + CORS + Compression**
- 🔑 **JWT** for authentication
- 🧾 **Idempotency + HMAC** signatures

### Deployment
- 🌩 **Render** (Frontend & Backend)
- 🔗 Environment variables for configuration

---

## 🔑 Seed Constraints

`ASSIGNMENT_SEED = FRONT25-008` (unique per student)

Used to:
- Derive **platformFee**: ` platform fee = (seed_number % 10)% of subtotal.`
- Generate **SKU codes**: `SKU-<listingId>-<chk8>-<cd>`
- Sign responses with header `X-Signature: HMAC-SHA256(responseJSON, seed)`
- Admin JWT secret derivation (seed-based)

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/<your-username>/geekhaven-resale.git
cd geekhaven-resale
cd backend
npm install
cp .env.example .env
# Fill in:
# MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
# JWT_SECRET=supersecretjwt
# ASSIGNMENT_SEED=GHW25-XXXX
# CORS_ORIGIN=http://localhost:5173
npm run dev

