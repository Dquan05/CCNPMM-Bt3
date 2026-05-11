import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: '' });

    // Client-side validation
    if (form.password !== form.confirmPassword) {
      return setStatus({ loading: false, message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
    }

    try {
      const res = await registerUser(form);
      setStatus({ loading: false, message: res.data.message, type: 'success' });
      setForm({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setStatus({ loading: false, message: msg, type: 'error' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <h1>Tạo Tài Khoản</h1>
          <p>Đăng ký để bắt đầu sử dụng</p>
        </div>

        {/* Alert */}
        {status.message && (
          <div className={`alert alert-${status.type}`} style={{ marginBottom: '18px' }}>
            {status.type === 'success' ? '✅ ' : '❌ '}{status.message}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="register-username">Tên người dùng</label>
            <input
              id="register-username"
              type="text"
              name="username"
              placeholder="Nhập tên của bạn..."
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Mật khẩu</label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-confirm">Xác nhận mật khẩu</label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={status.loading} id="btn-register">
            {status.loading && <span className="spinner" />}
            {status.loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        {/* Links */}
        <div className="auth-links">
          <span>
            Quên mật khẩu?{' '}
            <Link to="/forgot-password" id="link-forgot">Lấy lại ngay</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
