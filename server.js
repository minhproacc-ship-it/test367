require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 Rate limit cho endpoint verify (chống brute-force)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 50, // tối đa 50 request/IP
  message: { valid: false, message: 'Too many requests. Try again later.' }
});

// 🗄️ Database
const db = new sqlite3.Database('./keys.db', (err) => {
  if (err) console.error('DB Error:', err);
  db.run(`CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
  )`);
});

// 🔑 Hàm tạo key an toàn
function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Loại I, 1, O, 0 để tránh nhầm
  let key = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars[Math.floor(crypto.randomBytes(1)[0] % chars.length)];
  }
  return key;
}

// 🌐 Routes
// ✅ PUBLIC: Chỉ dùng để Roblox script kiểm tra key
app.get('/api/verify', verifyLimiter, (req, res) => {
  const { key } = req.query;
  if (!key) return res.json({ valid: false, message: 'Missing key' });

  db.get('SELECT * FROM keys WHERE key = ? AND status = ?', [key, 'active'], (err, row) => {
    if (err || !row) return res.json({ valid: false, message: 'Invalid key' });
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return res.json({ valid: false, message: 'Key expired' });
    }
    if (row.used_count >= row.max_uses) {
      return res.json({ valid: false, message: 'Key max uses reached' });
    }

    // Đánh dấu đã dùng
    db.run('UPDATE keys SET used_count = used_count + 1 WHERE id = ?', row.id, () => {
      res.json({ valid: true, message: 'Key accepted', remaining: row.max_uses - row.used_count - 1 });
    });
  });
});

// 🔐 ADMIN: Tạo key (NÊN BẢO VỆ BẰNG PASSWORD/JWT TRONG THỰC TẾ)
app.post('/api/generate', (req, res) => {
  const { password, max_uses = 1, days = 30 } = req.body;
  if (password !== process.env.ADMIN_PASS) return res.status(403).json({ error: 'Unauthorized' });

  const key = generateKey();
  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  db.run('INSERT INTO keys (key, max_uses, expires_at) VALUES (?, ?, ?)', 
    [key, max_uses, expires.toISOString()], 
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ key, max_uses, expires: expires.toISOString() });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
