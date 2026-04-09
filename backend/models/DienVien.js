const mongoose = require('mongoose');

const dienVienSchema = new mongoose.Schema({
  TenDienVien: { type: String, required: true, maxlength: 100 },
  NgaySinh: { type: Date },
  MaQuocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'QuocGia' },
  TieuSu: { type: String },
  HinhAnh: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DienVien', dienVienSchema, 'dienvien');
