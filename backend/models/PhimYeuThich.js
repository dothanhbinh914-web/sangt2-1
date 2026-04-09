const mongoose = require('mongoose');

const phimYeuThichSchema = new mongoose.Schema({
  MaPhim: { type: mongoose.Schema.Types.ObjectId, ref: 'Phim', required: true },
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan', required: true },
  NgayThem: { type: Date, default: Date.now }
});

phimYeuThichSchema.index({ MaPhim: 1, UserID: 1 }, { unique: true });

module.exports = mongoose.model('PhimYeuThich', phimYeuThichSchema, 'phim_yeuthich');
