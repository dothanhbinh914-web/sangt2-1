const mongoose = require('mongoose');

const quocGiaSchema = new mongoose.Schema({
  TenQuocGia: { type: String, required: true, maxlength: 100, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('QuocGia', quocGiaSchema, 'quocgia');
