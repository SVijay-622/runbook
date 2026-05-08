require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Status = require('./models/Status');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ── MongoDB Connection ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Employees List ──────────────────────────────────────────────────────────
const EMPLOYEES = [
  'Vijayandiran S', 'Swathi', 'Ummu Halima', 'Fahad', 'Faaiz',
  'Riaz', 'Ismail', 'Hashim', 'Javith', 'Ajay', 'Sangeetha', 'Raj', 'Gokul'
];

// GET /api/employees
app.get('/api/employees', (req, res) => {
  res.json(EMPLOYEES);
});

// GET /api/status?date=YYYY-MM-DD
app.get('/api/status', async (req, res) => {
  try {
    const date = req.query.date || getTodayDate();
    const statuses = await Status.find({ date }).lean();
    res.json({ date, statuses, employees: EMPLOYEES });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/status/history?name=Raj
app.get('/api/status/history', async (req, res) => {
  try {
    const { name } = req.query;
    const filter = name ? { name } : {};
    const history = await Status.find(filter).sort({ date: -1 }).limit(90).lean();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/status  — upsert by name+date
app.post('/api/status', async (req, res) => {
  try {
    const { name, date, ...fields } = req.body;
    if (!name || !date) return res.status(400).json({ error: 'name and date are required' });

    const status = await Status.findOneAndUpdate(
      { name, date },
      { ...fields, name, date, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/summary?date=YYYY-MM-DD  — aggregated numbers
app.get('/api/summary', async (req, res) => {
  try {
    const date = req.query.date || getTodayDate();
    const statuses = await Status.find({ date }).lean();

    const summary = {
      inProgress: 0, onHold: 0, jiraInProgress: 0,
      acr: 0, air: 0, deEscalated: 0, open: 0,
      afr: 0, anp: 0, rcaPending: 0
    };

    statuses.forEach(s => {
      Object.keys(summary).forEach(k => {
        summary[k] += s[k] || 0;
      });
    });

    res.json({ date, summary, submitted: statuses.length, total: EMPLOYEES.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
