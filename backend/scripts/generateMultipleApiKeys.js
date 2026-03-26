// backend/scripts/generateMultipleApiKeys.js
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Define only the clients you need
const clients = ["SCRAPER_API_KEY", "FRONTEND_API_KEY"];

// Generate a random 32-byte key for each client
const newKeys = {};
clients.forEach(client => {
    newKeys[client] = crypto.randomBytes(32).toString("hex");
});

// Read existing .env or create if it doesn't exist
const envPath = ".env";
let envContent = "";
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
}

// Remove old keys for these clients if they exist
clients.forEach(client => {
    const regex = new RegExp(`^${client}=.*$`, "gm");
    envContent = envContent.replace(regex, "");
});

// Append new keys
for (const client in newKeys) {
    envContent += `\n${client}=${newKeys[client]}`;
}

// Write back to .env
fs.writeFileSync(envPath, envContent.trim() + "\n");

console.log("✅ New API keys generated and saved to .env:");
for (const client in newKeys) {
    console.log(`${client}: ${newKeys[client]}`);
}