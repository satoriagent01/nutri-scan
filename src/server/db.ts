import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database;

export function initDb() {
  const dbPath = path.join(__dirname, '../../data/nutri-scan.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      brand TEXT,
      serving_size TEXT,
      serving_grams REAL,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      fiber REAL,
      sugar REAL,
      sodium REAL,
      saturated_fat REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_nutrients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'g',
      daily_goal REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meal_items (
      id TEXT PRIMARY KEY,
      meal_id TEXT NOT NULL,
      product_id TEXT,
      custom_nutrient_id TEXT,
      amount_grams REAL,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      fiber REAL,
      sugar REAL,
      sodium REAL,
      saturated_fat REAL,
      custom_values TEXT,
      FOREIGN KEY (meal_id) REFERENCES meals(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (custom_nutrient_id) REFERENCES custom_nutrients(id)
    );

    CREATE TABLE IF NOT EXISTS daily_totals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      calories REAL DEFAULT 0,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      fiber REAL DEFAULT 0,
      sugar REAL DEFAULT 0,
      sodium REAL DEFAULT 0,
      saturated_fat REAL DEFAULT 0,
      custom_values TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export function getDb(): Database.Database {
  if (!db) initDb();
  return db;
}
