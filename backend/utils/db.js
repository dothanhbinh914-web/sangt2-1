const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Xóa $jsonSchema validators trên các collection
    // (Mongoose tự handle validation, MongoDB strict validators gây xung đột kiểu dữ liệu)
    const db = mongoose.connection.db;
    const collectionsToFix = [
      'phim', 'tapphim', 'tai_khoan', 'theloai', 'quocgia',
      'dienvien', 'daodien', 'lichsu', 'danhgia', 'binhluan',
      'video', 'phim_yeuthich', 'phim_view_logs'
    ];

    for (const colName of collectionsToFix) {
      try {
        await db.command({
          collMod: colName,
          validator: {},
          validationLevel: 'off'
        });
      } catch {
        // Collection chưa tồn tại → bỏ qua
      }
    }
    console.log('MongoDB validators cleared (Mongoose handles validation)');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
