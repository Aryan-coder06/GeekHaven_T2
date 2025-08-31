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
        price: toPaise(p.price), 
        category: isStr(p.category) ? p.category.trim().toLowerCase() : "misc",
        location: isStr(p.location) ? p.location.trim() : "Unknown",
        images: toArr(p.images).length ? toArr(p.images) : placeholders(p.title),
        sellerId: seller._id,    
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

