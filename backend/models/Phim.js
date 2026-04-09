const mongoose = require('mongoose');

const phimSchema = new mongoose.Schema({
  TenPhim: { type: String, required: true, maxlength: 100 },
  TieuDe: { type: String },
  MoTa: { type: String },
  NoiDung: { type: String },
  ThoiLuong: { type: Number },
  NamPhatHanh: { type: Number },
  DanhGia: { type: Number, default: 0 },
  LuotXem: { type: Number, default: 0 },
  TinhTrang: { type: String, enum: ['Đang chiếu', 'Sắp chiếu', 'Đã kết thúc'] },
  PhanLoai: { type: String, enum: ['Lẻ', 'Bộ'] },
  HinhAnh: { type: String },
  HinhAnhBanner: { type: String },
  Link: { type: String },
  NgayTao: { type: Date, default: Date.now },
  NgayCapNhat: { type: Date, default: Date.now },
  MaQuocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'QuocGia' },
  TheLoai: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TheLoai' }],
  DienVien: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DienVien' }],
  DaoDien: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DaoDien' }]
}, { timestamps: true });

phimSchema.index({ TenPhim: 'text', TieuDe: 'text', MoTa: 'text' });
phimSchema.index({ MaQuocGia: 1 });
phimSchema.index({ TheLoai: 1 });
phimSchema.index({ NamPhatHanh: -1 });
phimSchema.index({ LuotXem: -1 });
phimSchema.index({ DanhGia: -1 });

module.exports = mongoose.model('Phim', phimSchema, 'phim');
