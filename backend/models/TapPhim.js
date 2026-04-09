const mongoose = require('mongoose');

const tapPhimSchema = new mongoose.Schema({
  MaPhim: { type: mongoose.Schema.Types.ObjectId, ref: 'Phim', required: true },
  TenTap: { type: String, maxlength: 50 },
  Link: { type: String },
  original_file: { type: String },
  hls_url: { type: String },
  cloudflare_uid: { type: String },
  video_uid: { type: String },
  r2_folder: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'ready', 'error'], default: 'pending' },
  duration: { type: Number }
}, { timestamps: true });

tapPhimSchema.index({ MaPhim: 1 });

module.exports = mongoose.model('TapPhim', tapPhimSchema, 'tapphim');
