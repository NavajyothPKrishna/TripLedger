const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files if run together locally, or fallback
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;

// Cloud database pool configuration supporting Supabase/Render and local fallback
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to sanitize empty strings into null for SQL
const emptyToNull = (val) => (val === '' || val === undefined ? null : val);

// 1. Users Registration
app.post('/api/users', async (req, res) => {
  let { userId, fullName, email, phone, passwordHash, createdAt } = req.body;
  createdAt = emptyToNull(createdAt);
  try {
    const query = `
      INSERT INTO users (user_id, full_name, email, phone, password_hash, created_at) 
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))
    `;
    await pool.query(query, [userId, fullName, email, phone, passwordHash, createdAt]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Trips Creation
app.post('/api/trips', async (req, res) => {
  const { tripId, tripName, description, startDate, endDate, baseCurrency, coordinatorId } = req.body;
  try {
    const query = `
      INSERT INTO trips (trip_id, trip_name, description, start_date, end_date, base_currency, coordinator_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(query, [tripId, tripName, description, startDate, endDate, baseCurrency, coordinatorId]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Trip Members
app.post('/api/trip-members', async (req, res) => {
  let { tripId, userId, role, joinedAt } = req.body;
  joinedAt = emptyToNull(joinedAt);
  try {
    const query = `
      INSERT INTO trip_members (trip_id, user_id, role, joined_at) 
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP))
    `;
    await pool.query(query, [tripId, userId, role, joinedAt]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Itinerary Items
app.post('/api/itinerary', async (req, res) => {
  let { itemId, tripId, location, activityType, dayNumber, startTime, endTime, notes } = req.body;
  startTime = emptyToNull(startTime);
  endTime = emptyToNull(endTime);
  try {
    const query = `
      INSERT INTO itinerary_items (item_id, trip_id, location, activity_type, day_number, start_time, end_time, notes) 
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP), $7, $8)
    `;
    await pool.query(query, [itemId, tripId, location, activityType, dayNumber, startTime, endTime, notes]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Expenses
app.post('/api/expenses', async (req, res) => {
  let { expenseId, tripId, description, totalAmount, currency, paidBy, category, expenseDate, itineraryItemId } = req.body;
  itineraryItemId = emptyToNull(itineraryItemId);
  try {
    const query = `
      INSERT INTO expenses (expense_id, trip_id, description, total_amount, currency, paid_by, category, expense_date, itinerary_item_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    await pool.query(query, [expenseId, tripId, description, totalAmount, currency, paidBy, category, expenseDate, itineraryItemId]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Expense Splits
app.post('/api/expense-splits', async (req, res) => {
  const { expenseId, splits } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let split of splits) {
      await client.query(
        `INSERT INTO expense_splits (expense_id, user_id, split_amount) VALUES ($1, $2, $3)`,
        [expenseId, split.userId, split.amount]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// 7. Member Balances (Seed / Update)
app.post('/api/member-balances', async (req, res) => {
  const { tripId, userId, netBalance } = req.body;
  try {
    const query = `
      INSERT INTO member_balances (trip_id, user_id, net_balance) 
      VALUES ($1, $2, $3)
      ON CONFLICT (trip_id, user_id) 
      DO UPDATE SET net_balance = EXCLUDED.net_balance;
    `;
    await pool.query(query, [tripId, userId, netBalance]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
