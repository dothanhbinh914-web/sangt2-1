const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Phim = require('../models/Phim');
const TapPhim = require('../models/TapPhim');
const LichSu = require('../models/LichSu');
const { protect } = require('../middleware/auth');

// Register referenced models cho populate
require('../models/TheLoai');
require('../models/QuocGia');
require('../models/DienVien');
require('../models/DaoDien');

// GET /api/movies - Tất cả phim (phân trang)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      Phim.find()
        .populate('MaQuocGia', 'TenQuocGia')
        .populate('TheLoai', 'TenTheLoai')
        .sort({ NgayTao: -1 })
        .skip(skip)
        .limit(limit),
      Phim.countDocuments()
    ]);

    const moviesWithEpisodes = await Promise.all(
      movies.map(async (movie) => {
        const soTap = await TapPhim.countDocuments({ MaPhim: movie._id });
        return { ...movie.toObject(), SoTap: soTap };
      })
    );

    res.json({
      movies: moviesWithEpisodes,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/featured - Phim nổi bật
router.get('/featured', async (req, res) => {
  try {
    const movies = await Phim.find()
      .populate('MaQuocGia', 'TenQuocGia')
      .populate('TheLoai', 'TenTheLoai')
      .sort({ LuotXem: -1, DanhGia: -1 })
      .limit(8);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/search - Tìm kiếm
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (q) {
      query = { TenPhim: { $regex: q, $options: 'i' } };
    }

    const [movies, total] = await Promise.all([
      Phim.find(query)
        .populate('MaQuocGia', 'TenQuocGia')
        .populate('TheLoai', 'TenTheLoai')
        .skip(skip)
        .limit(parseInt(limit)),
      Phim.countDocuments(query)
    ]);

    const moviesWithEpisodes = await Promise.all(
      movies.map(async (movie) => {
        const soTap = await TapPhim.countDocuments({ MaPhim: movie._id });
        return { ...movie.toObject(), SoTap: soTap };
      })
    );

    res.json({
      movies: moviesWithEpisodes,
      pagination: {
        page: parseInt(page), limit: parseInt(limit), total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/filter - Lọc phim
router.get('/filter', async (req, res) => {
  try {
    const { quocgia, theloai, nam, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (quocgia) query.MaQuocGia = quocgia;
    if (theloai) query.TheLoai = { $in: [theloai] };
    if (nam) query.NamPhatHanh = parseInt(nam);

    const [movies, total] = await Promise.all([
      Phim.find(query)
        .populate('MaQuocGia', 'TenQuocGia')
        .populate('TheLoai', 'TenTheLoai')
        .skip(skip)
        .limit(parseInt(limit)),
      Phim.countDocuments(query)
    ]);

    const moviesWithEpisodes = await Promise.all(
      movies.map(async (movie) => {
        const soTap = await TapPhim.countDocuments({ MaPhim: movie._id });
        return { ...movie.toObject(), SoTap: soTap };
      })
    );

    res.json({
      movies: moviesWithEpisodes,
      pagination: {
        page: parseInt(page), limit: parseInt(limit), total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/history - Lịch sử xem (cần auth)
router.get('/history', protect, async (req, res) => {
  try {
    const history = await LichSu.find({ UserID: req.user._id })
      .populate({
        path: 'MaPhim',
        populate: [
          { path: 'MaQuocGia', select: 'TenQuocGia' },
          { path: 'TheLoai', select: 'TenTheLoai' }
        ]
      })
      .sort({ ThoiGian: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/:id - Chi tiết phim
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID phim không hợp lệ' });
    }

    const movie = await Phim.findById(req.params.id)
      .populate('MaQuocGia', 'TenQuocGia')
      .populate('TheLoai', 'TenTheLoai')
      .populate('DienVien', 'TenDienVien HinhAnh')
      .populate('DaoDien', 'TenDaoDien HinhAnh');

    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });

    const episodes = await TapPhim.find({ MaPhim: movie._id }).sort({ TenTap: 1 });

    await Phim.findByIdAndUpdate(req.params.id, { $inc: { LuotXem: 1 } });

    res.json({ ...movie.toObject(), episodes, SoTap: episodes.length });
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/movies/:id/history - Lưu lịch sử xem
router.post('/:id/history', protect, async (req, res) => {
  try {
    const { MaTap, ThoiGianXem } = req.body;
    await LichSu.findOneAndUpdate(
      { UserID: req.user._id, MaPhim: req.params.id },
      {
        UserID: req.user._id,
        TenDN: req.user.ten_dang_nhap,
        MaPhim: req.params.id,
        MaTap,
        ThoiGianXem: ThoiGianXem || 0,
        ThoiGian: new Date()
      },
      { upsert: true, new: true }
    );
    res.json({ message: 'Đã lưu lịch sử xem' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
