import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: '' });
    try {
      const res = await forgotPassword({ email });
      setStatus({ loading: false, message: res.data.message, type: 'success' });
      setEmail('');
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
          <div className="auth-logo-icon">🔐</div>
          <h1>Quên Mật Khẩu</h1>
          <p>Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        {/* Alert */}
        {status.message && (
          <div className={`alert alert-${status.type}`} style={{ marginBottom: '18px' }}>
            {status.type === 'success' ? '📧 ' : '❌ '}{status.message}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="forgot-email">Địa chỉ Email</label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={status.loading} id="btn-forgot">
            {status.loading && <span className="spinner" />}
            {status.loading ? 'Đang gửi...' : 'Gửi Hướng Dẫn'}
          </button>
        </form>

        {/* Info box */}
        <div style={{
          marginTop: '20px',
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '0.825rem',
          color: '#a5b4fc',
        }}>
          💡 Kiểm tra hộp thư <strong>Spam / Junk</strong> nếu không thấy email trong vài phút.
        </div>

        {/* Links */}
        <div className="auth-links" style={{ marginTop: '20px' }}>
          <span>
            Nhớ mật khẩu rồi?{' '}
            <Link to="/register" id="link-back-register">Quay lại đăng ký</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
