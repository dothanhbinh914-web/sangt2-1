const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const TaiKhoan = require('../models/TaiKhoan');
const { generateToken, protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Định dạng ảnh không hợp lệ'));
  },
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { ten_dang_nhap, mat_khau, email, ho_ten } = req.body;
    if (!ten_dang_nhap || !mat_khau || !email) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    const exists = await TaiKhoan.findOne({ $or: [{ email }, { ten_dang_nhap }] });
    if (exists) {
      return res.status(400).json({ message: 'Email hoặc tên đăng nhập đã tồn tại' });
    }
    const user = await TaiKhoan.create({
      ten_dang_nhap, mat_khau, email,
      ho_ten: ho_ten || ten_dang_nhap,
      vai_tro: 'user',
      trang_thai: 'active'
    });
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        ten_dang_nhap: user.ten_dang_nhap,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: user.vai_tro,
        hinh_dai_dien: user.hinh_dai_dien
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { ten_dang_nhap, mat_khau } = req.body;
    if (!ten_dang_nhap || !mat_khau) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }
    const user = await TaiKhoan.findOne({
      $or: [{ ten_dang_nhap }, { email: ten_dang_nhap }]
    });
    if (!user || !(await user.comparePassword(mat_khau))) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    if (user.trang_thai === 'banned') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }
    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        ten_dang_nhap: user.ten_dang_nhap,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: user.vai_tro,
        hinh_dai_dien: user.hinh_dai_dien
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await TaiKhoan.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }
    // In production: send email with reset link
    res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { ho_ten, email } = req.body;
    if (email && email !== req.user.email) {
      const exists = await TaiKhoan.findOne({ email, _id: { $ne: req.user._id } });
      if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    const user = await TaiKhoan.findByIdAndUpdate(
      req.user._id,
      { ho_ten, email, ngay_cap_nhat: new Date() },
      { new: true }
    ).select('-mat_khau');
    res.json({ message: 'Cập nhật thông tin thành công!', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/upload-avatar
router.post('/upload-avatar', protect, upload.single('hinh_dai_dien_file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Không có file được upload' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await TaiKhoan.findByIdAndUpdate(
      req.user._id,
      { hinh_dai_dien: avatarUrl, ngay_cap_nhat: new Date() },
      { new: true }
    ).select('-mat_khau');
    res.json({ message: 'Cập nhật ảnh thành công!', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { old_password, new_password, new_password_confirmation } = req.body;
    if (!old_password || !new_password || !new_password_confirmation) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (new_password !== new_password_confirmation) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    const user = await TaiKhoan.findById(req.user._id);
    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    user.mat_khau = new_password;
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
