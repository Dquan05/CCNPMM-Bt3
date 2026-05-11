import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/authApi';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setStatus({ loading: false, message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
    }
    setStatus({ loading: true, message: '', type: '' });
    try {
      const res = await resetPassword({ token, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      setStatus({ loading: false, message: res.data.message, type: 'success' });
      // Tự redirect sau 2.5 giây
      setTimeout(() => navigate('/register'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.';
      setStatus({ loading: false, message: msg, type: 'error' });
    }
  };

  // Không có token trong URL
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo-icon">⚠️</div>
          <h1 style={{ color: '#f87171', fontSize: '1.25rem', marginTop: '12px' }}>Link Không Hợp Lệ</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px', marginBottom: '20px' }}>
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link to="/forgot-password" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px', textDecoration: 'none' }}>
            Yêu Cầu Link Mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🔑</div>
          <h1>Đặt Lại Mật Khẩu</h1>
          <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {/* Alert */}
        {status.message && (
          <div className={`alert alert-${status.type}`} style={{ marginBottom: '18px' }}>
            {status.type === 'success' ? '✅ ' : '❌ '}{status.message}
            {status.type === 'success' && (
              <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '4px', opacity: 0.8 }}>
                Đang chuyển hướng...
              </span>
            )}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="reset-new-password">Mật Khẩu Mới</label>
            <input
              id="reset-new-password"
              type="password"
              name="newPassword"
              placeholder="Tối thiểu 6 ký tự"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="field-group">
            <label htmlFor="reset-confirm-password">Xác Nhận Mật Khẩu</label>
            <input
              id="reset-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={status.loading || status.type === 'success'} id="btn-reset">
            {status.loading && <span className="spinner" />}
            {status.loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Lại'}
          </button>
        </form>

        {/* Links */}
        <div className="auth-links" style={{ marginTop: '20px' }}>
          <Link to="/forgot-password" id="link-request-new">Yêu cầu link mới</Link>
        </div>
      </div>
    </div>
  );
}
