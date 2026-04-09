const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
  TenDN: { type: String, required: true },
  MaPhim: { type: mongoose.Schema.Types.ObjectId, ref: 'Phim', required: true },
  SoDiem: { type: Number, min: 1, max: 10 },
  BinhLuan: { type: String },
  ThoiGian: { type: Date, default: Date.now }
});

danhGiaSchema.index({ TenDN: 1, MaPhim: 1 }, { unique: true });
danhGiaSchema.index({ MaPhim: 1 });

module.exports = mongoose.model('DanhGia', danhGiaSchema, 'danhgia');
