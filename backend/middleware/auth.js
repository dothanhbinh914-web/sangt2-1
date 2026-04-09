const jwt = require('jsonwebtoken');
const TaiKhoan = require('../models/TaiKhoan');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await TaiKhoan.findById(decoded.id).select('-mat_khau');
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }
    if (user.trang_thai === 'banned') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.vai_tro === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = { protect, adminOnly, generateToken };
