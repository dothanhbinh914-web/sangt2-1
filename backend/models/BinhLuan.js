const mongoose = require('mongoose');

const binhLuanSchema = new mongoose.Schema({
  TenDN: { type: String, required: true },
  MaPhim: { type: mongoose.Schema.Types.ObjectId, ref: 'Phim', required: true },
  NoiDung: { type: String, required: true },
  ThoiGian: { type: Date, default: Date.now },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BinhLuan' }
});

binhLuanSchema.index({ MaPhim: 1 });
binhLuanSchema.index({ TenDN: 1 });
binhLuanSchema.index({ parent_id: 1 });

module.exports = mongoose.model('BinhLuan', binhLuanSchema, 'binhluan');
