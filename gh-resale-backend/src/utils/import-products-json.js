// // // backend/src/utils/import-products-json.js
// import "dotenv/config";
// import fs from "fs";
// import path from "path";
// import mongoose from "mongoose";
// import { fileURLToPath } from "url";

// import { connectMongo } from "../db/mongo.js";                 // from src/utils -> ../db
// import User from "../models/user.model.js";                    // from src/utils -> ../models
// import Listing from "../models/listing.model.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname  = path.dirname(__filename);

// const arg = (name, fallback = undefined) => {
//   const i = process.argv.indexOf(name);
//   if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
//     return process.argv[i + 1];
//   }
//   return fallback;
// };

// const FLAG_RESET             = process.argv.includes("--reset");
// const DEFAULT_JSON_RELATIVE  = "../data/products.json"; // from src/utils -> ../data
// const DEFAULT_JSON           = path.resolve(__dirname, DEFAULT_JSON_RELATIVE);
// const JSON_PATH              = path.resolve(process.cwd(), arg("--file", DEFAULT_JSON));
// const DEFAULT_SELLER_EMAIL   = arg("--seller", "seller@example.com");

// // ---- helpers ----
// const isNonEmptyStr = (v) => typeof v === "string" && v.trim().length > 0;
// const toArray       = (v) => Array.isArray(v) ? v : (isNonEmptyStr(v) ? [v] : []);
// const rand          = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// const PLACEHOLDER_IMAGES = (seed = "p") => ([
//   `https://picsum.photos/seed/${encodeURIComponent(seed)}-a/800/600`,
//   `https://picsum.photos/seed/${encodeURIComponent(seed)}-b/800/600`,
// ]);

// function toPaise(item) {
//   // Accept rupees or explicit paise
//   if (typeof item.pricePaise === "number") return Math.max(0, Math.round(item.pricePaise));
//   if (typeof item.price === "number")      return Math.max(0, Math.round(item.price * 100));
//   throw new Error(`Missing price/pricePaise for "${item.title || "Unknown"}"`);
// }

// async function ensureSeller(email) {
//   const e = isNonEmptyStr(email) ? email : DEFAULT_SELLER_EMAIL;
//   let user = await User.findOne({ email: e });
//   if (!user) {
//     user = await User.create({
//       name: e.split("@")[0],
//       email: e,
//       password: "demo123",  // plaintext ok for seed data; you can hash in real flows
//       role: "SELLER",
//       sellerProfile: {
//         shopName: `Shop of ${e.split("@")[0]}`,
//         bio: "Demo seller seeded from JSON",
//         avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(e)}`,
//         address: "India",
//       },
//       rating: 4 + Math.random(),
//     });
//     console.log("👤 Created seller:", e);
//   }
//   return user;
// }

// async function upsertListing(raw, sellerId) {
//   const title = (raw.title || "").toString().trim();
//   if (!title) throw new Error("title is required");

//   const description = (raw.description || "").toString().trim() || "No description provided.";
//   const price       = toPaise(raw); // paise
//   const category    = (raw.category || "misc").toString().trim().toLowerCase();
//   const location    = (raw.location || "Unknown").toString().trim();
//   let   images      = toArray(raw.images);
//   if (!images.length) images = PLACEHOLDER_IMAGES(title.replace(/\s+/g, "-").toLowerCase());

//   const isFeatured  = !!raw.isFeatured;
//   const createdAt   = raw.createdAt ? new Date(raw.createdAt) : new Date(Date.now() - rand(0, 10) * 86400000);

//   // De-dup key: title + price + seller
//   const existing = await Listing.findOne({ title, price, sellerId }).lean();
//   if (existing) {
//     await Listing.updateOne(
//       { _id: existing._id },
//       { $set: { description, category, location, images, isFeatured } }
//     );
//     return { _id: existing._id, updated: true };
//   }

//   const doc = await Listing.create({
//     title,
//     description,
//     price,
//     category,
//     location,
//     images,
//     sellerId,
//     isFeatured,
//     createdAt,
//   });
//   return { _id: doc._id, created: true };
// }

// async function main() {
//   console.log("➡️  Reading JSON:", JSON_PATH);
//   const jsonStr = fs.readFileSync(JSON_PATH, "utf8");
//   const items   = JSON.parse(jsonStr);
//   if (!Array.isArray(items)) throw new Error("JSON must be an array of products");

//   await connectMongo(process.env.MONGODB_URL);
//   console.log("✅ Connected to MongoDB");

//   if (FLAG_RESET) {
//     await Listing.deleteMany({});
//     console.log("🧹 Cleared existing listings.");
//   }

//   // Default/global seller
//   const globalSeller = await ensureSeller(DEFAULT_SELLER_EMAIL);

//   let created = 0, updated = 0, failed = 0;
//   for (let i = 0; i < items.length; i++) {
//     const row = items[i];
//     try {
//       const sellerEmail = row.sellerEmail || DEFAULT_SELLER_EMAIL;
//       const seller      = (sellerEmail === DEFAULT_SELLER_EMAIL) ? globalSeller : await ensureSeller(sellerEmail);
//       const res         = await upsertListing(row, seller._id);
//       if (res.created) created++;
//       if (res.updated) updated++;
//     } catch (e) {
//       failed++;
//       console.warn(`⚠️  Row ${i}: ${e.message}`);
//     }
//   }

//   console.log(`\n📦 Import complete. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
//   await mongoose.disconnect();
//   process.exit(0);
// }

// main().catch(async (e) => {
//   console.error("❌ Import failed:", e);
//   try { await mongoose.disconnect(); } catch {}
//   process.exit(1);
// });
// Simple JSON → Mongo seeder (normalized): inserts listings using a default seller,
// then prints a sample with populate so you SEE sellerId expanded, plus sku & timestamps.

import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import { connectMongo } from "../db/mongo.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const JSON_PATH = path.resolve(__dirname, "../data/products.json");

// helpers
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const toArr = (v) => Array.isArray(v) ? v : (isStr(v) ? [v] : []);
const placeholders = (seed="p") => ([
  `https://picsum.photos/seed/${encodeURIComponent(seed)}-a/800/600`,
  `https://picsum.photos/seed/${encodeURIComponent(seed)}-b/800/600`,
]);
const toPaise = (rupees) => {
  if (typeof rupees !== "number") throw new Error("price must be number (rupees)");
  return Math.max(0, Math.round(rupees * 100));
};

async function ensureSeller(email = "demo2@example.com") {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "demo2",
      email,
      password: "demo123", // ok for seed/demo
      role: "SELLER",
      sellerProfile: {
        shopName: "Shop of demo2",
        bio: "Demo seller seeded from JSON",
        avatarUrl: "https://i.pravatar.cc/150?u=demo2%40example.com",
        address: "India"
      },
      rating: 4.6
    });
    console.log("👤 Created seller:", email);
  } else {
    console.log("👤 Using seller:", email);
  }
  return user;
}

async function main() {
  try {
    await connectMongo(process.env.MONGODB_URL);
    console.log("✅ MongoDB connected");

    const seller = await ensureSeller("demo2@example.com");

    const json = fs.readFileSync(JSON_PATH, "utf8");
    const items = JSON.parse(json);
    if (!Array.isArray(items)) throw new Error("products.json must be an array");

    const ids = [];
    let inserted = 0, skipped = 0;
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      if (!isStr(p.title) || typeof p.price !== "number") {
        console.warn(`⚠️ Skipping row ${i}: missing title or price`);
        skipped++; continue;
      }

      const doc = {
        title: String(p.title).trim(),
        description: isStr(p.description) ? String(p.description).trim() : "No description provided.",
        price: toPaise(p.price), // store paise
        category: isStr(p.category) ? p.category.trim().toLowerCase() : "misc",
        location: isStr(p.location) ? p.location.trim() : "Unknown",
        images: toArr(p.images).length ? toArr(p.images) : placeholders(p.title),
        sellerId: seller._id,    // normalized reference
        isFeatured: !!p.isFeatured,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      };

      try {
        const created = await Listing.create(doc);
        ids.push(created._id);
        inserted++;
      } catch (e) {
        console.warn(`⚠️ Insert failed at row ${i}: ${e.message}`);
      }
    }

    console.log(`\n📦 Inserted: ${inserted}, Skipped: ${skipped}`);

    // Print a sample with POPULATE so you see your desired shape
    if (ids.length) {
      const sample = await Listing.findById(ids[0])
        .populate('sellerId', 'name sellerProfile avatar rating')
        .lean();
      console.log("\n🔎 Sample inserted doc (populated):");
      console.dir(sample, { depth: null, colors: true });
    }
  } catch (e) {
    console.error("❌ Seed failed:", e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();

