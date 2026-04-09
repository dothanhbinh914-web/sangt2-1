const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const taiKhoanSchema = new mongoose.Schema({
  ten_dang_nhap: { type: String, required: true, maxlength: 50, unique: true },
  mat_khau: { type: String, required: true, maxlength: 255 },
  email: { type: String, required: true, maxlength: 100, unique: true },
  google_id: { type: String, sparse: true },
  facebook_id: { type: String, sparse: true },
  ho_ten: { type: String, maxlength: 100 },
  hinh_dai_dien: { type: String, maxlength: 255, default: '' },
  vai_tro: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  trang_thai: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  ngay_tao: { type: Date, default: Date.now },
  ngay_cap_nhat: { type: Date, default: Date.now }
});

taiKhoanSchema.pre('save', async function(next) {
  if (!this.isModified('mat_khau')) return next();
  this.mat_khau = await bcrypt.hash(this.mat_khau, 12);
  this.ngay_cap_nhat = new Date();
  next();
});

taiKhoanSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.mat_khau);
};

module.exports = mongoose.model('TaiKhoan', taiKhoanSchema, 'tai_khoan');
