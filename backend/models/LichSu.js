const mongoose = require('mongoose');

const lichSuSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' },
  TenDN: { type: String, required: true },
  MaPhim: { type: mongoose.Schema.Types.ObjectId, ref: 'Phim', required: true },
  MaTap: { type: mongoose.Schema.Types.ObjectId, ref: 'TapPhim' },
  ThoiGianXem: { type: Number, default: 0 },
  ThoiGian: { type: Date, default: Date.now }
});

lichSuSchema.index({ UserID: 1 });
lichSuSchema.index({ TenDN: 1, MaPhim: 1 }, { unique: true });

module.exports = mongoose.model('LichSu', lichSuSchema, 'lichsu');
