const mongoose = require('mongoose');

const theLoaiSchema = new mongoose.Schema({
  TenTheLoai: { type: String, required: true, maxlength: 50 }
}, { timestamps: true });

module.exports = mongoose.model('TheLoai', theLoaiSchema, 'theloai');
