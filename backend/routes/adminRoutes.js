const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Phim = require('../models/Phim');
const TapPhim = require('../models/TapPhim');
const TaiKhoan = require('../models/TaiKhoan');
const TheLoai = require('../models/TheLoai');
const QuocGia = require('../models/QuocGia');
const LichSu = require('../models/LichSu');
const DanhGia = require('../models/DanhGia');
require('../models/DienVien');
require('../models/DaoDien');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ========== THỐNG KÊ ==========
router.get('/stats', async (req, res) => {
  try {
    const [totalMovies, totalUsers, totalEpisodes, totalViews] = await Promise.all([
      Phim.countDocuments(),
      TaiKhoan.countDocuments(),
      TapPhim.countDocuments(),
      Phim.aggregate([{ $group: { _id: null, total: { $sum: '$LuotXem' } } }])
    ]);

    const topMovies = await Phim.find()
      .sort({ LuotXem: -1 })
      .limit(10)
      .select('TenPhim LuotXem DanhGia HinhAnh');

    const recentUsers = await TaiKhoan.find()
      .sort({ ngay_tao: -1 })
      .limit(5)
      .select('ten_dang_nhap email ngay_tao vai_tro');

    const genreStats = await Phim.aggregate([
      { $unwind: '$TheLoai' },
      { $group: { _id: '$TheLoai', count: { $sum: 1 } } },
      { $lookup: { from: 'theloai', localField: '_id', foreignField: '_id', as: 'genre' } },
      { $unwind: '$genre' },
      { $project: { TenTheLoai: '$genre.TenTheLoai', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalMovies,
      totalUsers,
      totalEpisodes,
      totalViews: totalViews[0]?.total || 0,
      topMovies,
      recentUsers,
      genreStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== QUẢN LÝ PHIM ==========
router.get('/movies', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};
    if (search) {
      query = { TenPhim: { $regex: search, $options: 'i' } };
    }
    const [movies, total] = await Promise.all([
      Phim.find(query)
        .populate('MaQuocGia', 'TenQuocGia')
        .populate('TheLoai', 'TenTheLoai')
        .sort({ NgayTao: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Phim.countDocuments(query)
    ]);
    res.json({ movies, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/movies', async (req, res) => {
  try {
    // Làm sạch data: loại bỏ fields rỗng để tránh MongoDB validator lỗi
    const data = { ...req.body };
    if (data.ThoiLuong) data.ThoiLuong = parseInt(data.ThoiLuong) || undefined;
    if (data.NamPhatHanh) data.NamPhatHanh = parseInt(data.NamPhatHanh) || undefined;
    if (!data.MaQuocGia) delete data.MaQuocGia;
    if (!data.TheLoai || data.TheLoai.length === 0) delete data.TheLoai;
    if (!data.DienVien || data.DienVien.length === 0) delete data.DienVien;
    if (!data.DaoDien || data.DaoDien.length === 0) delete data.DaoDien;

    // Xóa các field chuỗi rỗng
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === undefined) delete data[key];
    });

    const movie = await Phim.create(data);
    const populated = await Phim.findById(movie._id)
      .populate('MaQuocGia', 'TenQuocGia')
      .populate('TheLoai', 'TenTheLoai');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/movies/:id', async (req, res) => {
  try {
    const data = { ...req.body, NgayCapNhat: new Date() };
    if (data.ThoiLuong) data.ThoiLuong = parseInt(data.ThoiLuong) || undefined;
    if (data.NamPhatHanh) data.NamPhatHanh = parseInt(data.NamPhatHanh) || undefined;
    if (!data.MaQuocGia) delete data.MaQuocGia;
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === undefined) delete data[key];
    });

    const movie = await Phim.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('MaQuocGia', 'TenQuocGia')
      .populate('TheLoai', 'TenTheLoai');
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Phim.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    await TapPhim.deleteMany({ MaPhim: req.params.id });
    res.json({ message: 'Đã xóa phim và các tập phim liên quan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== QUẢN LÝ TẬP PHIM ==========
router.get('/episodes', async (req, res) => {
  try {
    const { movieId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};
    if (movieId) query.MaPhim = movieId;

    const [episodes, total] = await Promise.all([
      TapPhim.find(query)
        .populate('MaPhim', 'TenPhim')
        .sort({ TenTap: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      TapPhim.countDocuments(query)
    ]);
    res.json({ episodes, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/episodes', async (req, res) => {
  try {
    const episode = await TapPhim.create(req.body);
    const populated = await TapPhim.findById(episode._id).populate('MaPhim', 'TenPhim');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/episodes/:id', async (req, res) => {
  try {
    const episode = await TapPhim.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('MaPhim', 'TenPhim');
    if (!episode) return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    res.json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/episodes/:id', async (req, res) => {
  try {
    const episode = await TapPhim.findByIdAndDelete(req.params.id);
    if (!episode) return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    res.json({ message: 'Đã xóa tập phim' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== QUẢN LÝ NGƯỜI DÙNG ==========
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};
    if (search) {
      query = {
        $or: [
          { ten_dang_nhap: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { ho_ten: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const [users, total] = await Promise.all([
      TaiKhoan.find(query).select('-mat_khau').sort({ ngay_tao: -1 }).skip(skip).limit(parseInt(limit)),
      TaiKhoan.countDocuments(query)
    ]);
    res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { vai_tro, trang_thai } = req.body;
    const user = await TaiKhoan.findByIdAndUpdate(
      req.params.id,
      { vai_tro, trang_thai, ngay_cap_nhat: new Date() },
      { new: true }
    ).select('-mat_khau');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await TaiKhoan.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Đã xóa người dùng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== QUẢN LÝ THỂ LOẠI ==========
router.get('/genres', async (req, res) => {
  try {
    const genres = await TheLoai.find().sort({ TenTheLoai: 1 });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/genres', async (req, res) => {
  try {
    const genre = await TheLoai.create(req.body);
    res.status(201).json(genre);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/genres/:id', async (req, res) => {
  try {
    const genre = await TheLoai.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!genre) return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    res.json(genre);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/genres/:id', async (req, res) => {
  try {
    await TheLoai.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa thể loại' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== QUẢN LÝ QUỐC GIA ==========
router.get('/countries', async (req, res) => {
  try {
    const countries = await QuocGia.find().sort({ TenQuocGia: 1 });
    res.json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/countries', async (req, res) => {
  try {
    const country = await QuocGia.create(req.body);
    res.status(201).json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/countries/:id', async (req, res) => {
  try {
    const country = await QuocGia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!country) return res.status(404).json({ message: 'Không tìm thấy quốc gia' });
    res.json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/countries/:id', async (req, res) => {
  try {
    await QuocGia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa quốc gia' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
