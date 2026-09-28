import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';

const router = Router();

// ============ PRODUCTS ============

router.get('/products', (_req, res) => {
  const db = getDb();
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(products);
});

router.post('/products', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const { name, brand, serving_size, serving_grams, calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat } = req.body;
  db.prepare(`
    INSERT INTO products (id, name, brand, serving_size, serving_grams, calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name || null, brand || null, serving_size || null, serving_grams || 0, calories || 0, protein || 0, carbs || 0, fat || 0, fiber || 0, sugar || 0, sodium || 0, saturated_fat || 0);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json(product);
});

router.delete('/products/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ CUSTOM NUTRIENTS ============

router.get('/custom-nutrients', (_req, res) => {
  const db = getDb();
  const nutrients = db.prepare('SELECT * FROM custom_nutrients ORDER BY created_at ASC').all();
  res.json(nutrients);
});

router.post('/custom-nutrients', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const { name, unit, daily_goal } = req.body;
  db.prepare(`
    INSERT INTO custom_nutrients (id, name, unit, daily_goal)
    VALUES (?, ?, ?, ?)
  `).run(id, name, unit || 'g', daily_goal || null);
  const nutrient = db.prepare('SELECT * FROM custom_nutrients WHERE id = ?').get(id);
  res.json(nutrient);
});

router.delete('/custom-nutrients/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM custom_nutrients WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ MEALS ============

router.get('/meals', (req, res) => {
  const db = getDb();
  const date = req.query.date as string;
  let meals;
  if (date) {
    meals = db.prepare('SELECT * FROM meals WHERE date = ? ORDER BY created_at DESC').all(date);
  } else {
    meals = db.prepare('SELECT * FROM meals ORDER BY date DESC, created_at DESC').all();
  }
  res.json(meals);
});

router.post('/meals', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const { name, date } = req.body;
  db.prepare('INSERT INTO meals (id, name, date) VALUES (?, ?, ?)').run(id, name || null, date || new Date().toISOString().split('T')[0]);
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
  res.json(meal);
});

router.delete('/meals/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ MEAL ITEMS ============

router.post('/meal-items', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const { meal_id, product_id, custom_nutrient_id, amount_grams, calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, custom_values } = req.body;
  db.prepare(`
    INSERT INTO meal_items (id, meal_id, product_id, custom_nutrient_id, amount_grams, calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, custom_values)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, meal_id, product_id || null, custom_nutrient_id || null, amount_grams || 0, calories || 0, protein || 0, carbs || 0, fat || 0, fiber || 0, sugar || 0, sodium || 0, saturated_fat || 0, custom_values || null);
  const item = db.prepare('SELECT * FROM meal_items WHERE id = ?').get(id);
  // Update daily totals
  updateDailyTotals(db, new Date().toISOString().split('T')[0]);
  res.json(item);
});

router.delete('/meal-items/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM meal_items WHERE id = ?').get(req.params.id);
  if (item) {
    db.prepare('DELETE FROM meal_items WHERE id = ?').run(req.params.id);
    updateDailyTotals(db, item.date || new Date().toISOString().split('T')[0]);
  }
  res.json({ success: true });
});

router.get('/meal-items', (req, res) => {
  const db = getDb();
  const mealId = req.query.meal_id as string;
  if (mealId) {
    const items = db.prepare('SELECT * FROM meal_items WHERE meal_id = ?').all(mealId);
    res.json(items);
  } else {
    res.json([]);
  }
});

// ============ DAILY TOTALS ============

router.get('/daily-totals', (req, res) => {
  const db = getDb();
  const date = req.query.date as string || new Date().toISOString().split('T')[0];
  const totals = db.prepare('SELECT * FROM daily_totals WHERE date = ?').get(date);
  if (!totals) {
    res.json({ date, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, saturated_fat: 0, custom_values: '{}' });
  } else {
    res.json(totals);
  }
});

function updateDailyTotals(db: Database.Database, date: string) {
  const items = db.prepare(`
    SELECT 
      COALESCE(SUM(calories), 0) as calories,
      COALESCE(SUM(protein), 0) as protein,
      COALESCE(SUM(carbs), 0) as carbs,
      COALESCE(SUM(fat), 0) as fat,
      COALESCE(SUM(fiber), 0) as fiber,
      COALESCE(SUM(sugar), 0) as sugar,
      COALESCE(SUM(sodium), 0) as sodium,
      COALESCE(SUM(saturated_fat), 0) as saturated_fat
    FROM meal_items WHERE date = ?
  `).get(date);

  // Collect custom nutrient values
  const customNutrients = db.prepare('SELECT * FROM custom_nutrients').all();
  const customTotals: Record<string, number> = {};
  for (const cn of customNutrients) {
    const val = db.prepare(`
      SELECT COALESCE(SUM(json_extract(custom_values, ?)), 0) as total
      FROM meal_items WHERE date = ?
    `).get(`$.${cn.id}`, date);
    customTotals[cn.id] = val.total;
  }

  db.prepare(`
    INSERT INTO daily_totals (date, calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, custom_values, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET
      calories = excluded.calories,
      protein = excluded.protein,
      carbs = excluded.carbs,
      fat = excluded.fat,
      fiber = excluded.fiber,
      sugar = excluded.sugar,
      sodium = excluded.sodium,
      saturated_fat = excluded.saturated_fat,
      custom_values = excluded.custom_values,
      updated_at = datetime('now')
  `).run(
    date,
    items.calories,
    items.protein,
    items.carbs,
    items.fat,
    items.fiber,
    items.sugar,
    items.sodium,
    items.saturated_fat,
    JSON.stringify(customTotals)
  );
}

// ============ OCR ============

router.post('/ocr', async (req, res) => {
  const { imageData } = req.body;
  if (!imageData) {
    res.status(400).json({ error: 'No image data provided' });
    return;
  }
  // OCR will be handled client-side with Tesseract.js
  // This endpoint is for future server-side OCR if needed
  res.json({ message: 'OCR is handled client-side. Use the /api/products endpoint to save parsed data.' });
});

export { router };
