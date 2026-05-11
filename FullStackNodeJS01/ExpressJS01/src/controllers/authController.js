const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const transporter = require('../config/email');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 1. Validate input cơ bản
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Tên người dùng phải có ít nhất 3 ký tự.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email này đã được đăng ký.' });
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Tạo user mới trong MySQL
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 5. Trả về kết quả (không trả về password)
    return res.status(201).json({
      message: 'Đăng ký thành công!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email.' });
    }

    // 1. Kiểm tra email có tồn tại không
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    // Trả về thông báo chung (không tiết lộ email có tồn tại hay không - bảo mật)
    if (!user) {
      return res.status(200).json({
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn qua email.',
      });
    }

    // 2. Tạo reset token và thời hạn 1 giờ
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // +1 giờ

    // 3. Lưu token vào DB
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    // 4. Tạo link reset password
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // 5. Gửi email qua Mailtrap
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Yêu cầu đặt lại mật khẩu - CCNPMM App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Đặt Lại Mật Khẩu</h2>
          <p>Xin chào <strong>${user.username}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
          <a href="${resetLink}"
             style="display: inline-block; padding: 12px 24px; background-color: #4f46e5;
                    color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Đặt Lại Mật Khẩu
          </a>
          <p style="color: #666; font-size: 14px;">
            Link này sẽ hết hạn sau <strong>1 giờ</strong>.
          </p>
          <p style="color: #666; font-size: 14px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">CCNPMM App — Không trả lời email này.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn qua email.',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    return res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }

    // 1. Tìm user có token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    // 2. Kiểm tra token còn hạn không
    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'Token đã hết hạn. Vui lòng yêu cầu lại.' });
    }

    // 3. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Cập nhật password và xóa token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return res.status(200).json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error);
    return res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

module.exports = { register, forgotPassword, resetPassword };
