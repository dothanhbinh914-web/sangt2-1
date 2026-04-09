const mongoose = require('mongoose');

const daoDienSchema = new mongoose.Schema({
  TenDaoDien: { type: String, required: true, maxlength: 100 },
  NgaySinh: { type: Date },
  MaQuocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'QuocGia' },
  TieuSu: { type: String },
  HinhAnh: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DaoDien', daoDienSchema, 'daodien');
