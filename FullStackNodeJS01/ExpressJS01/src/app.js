require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CCNPMM API Server is running 🚀', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} không tồn tại.` });
});

// ── Sync DB & Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Kết nối MySQL thành công!');
    // sync({ force: false }) → tạo bảng nếu chưa có, không xóa dữ liệu cũ
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log('✅ Đồng bộ database hoàn tất.');
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    process.exit(1);
  });

module.exports = app;
