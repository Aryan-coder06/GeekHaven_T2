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

### Frontend
