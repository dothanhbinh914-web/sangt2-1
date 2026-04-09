const express = require('express');
const router = express.Router();
const TapPhim = require('../models/TapPhim');
const LichSu = require('../models/LichSu');
const { protect } = require('../middleware/auth');

// GET /api/episodes/:movieId - Lấy tất cả tập của phim
router.get('/:movieId', async (req, res) => {
  try {
    const episodes = await TapPhim.find({ MaPhim: req.params.movieId })
      .sort({ TenTap: 1 });
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/episodes/detail/:id - Lấy chi tiết 1 tập
router.get('/detail/:id', async (req, res) => {
  try {
    const episode = await TapPhim.findById(req.params.id).populate('MaPhim');
    if (!episode) return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    res.json(episode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// GET /api/episodes/play/:id - Lấy URL phát video
// Logic ưu tiên: hls_url > cloudflare_uid > Link (mp4)
// ============================================
router.get('/play/:id', async (req, res) => {
  try {
    const episode = await TapPhim.findById(req.params.id);
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }

    let url = '';
    let type = 'MP4';

    // Ưu tiên 1: hls_url có sẵn
    if (episode.hls_url) {
      url = episode.hls_url;
      type = 'HLS';
    }
    // Ưu tiên 2: Build HLS từ cloudflare_uid
    else if (episode.cloudflare_uid) {
      url = `https://customer-${process.env.CLOUDFLARE_CUSTOMER_CODE || 'f33zs165nr7gyfy4'}.cloudflarestream.com/${episode.cloudflare_uid}/manifest/video.m3u8`;
      type = 'HLS';
    }
    // Ưu tiên 3: Link mp4 trực tiếp
    else if (episode.Link) {
      url = episode.Link;
      type = 'MP4';
    }

    if (!url) {
      return res.status(404).json({ message: 'Video chưa có sẵn' });
    }

    res.json({
      url,
      type,
      episodeId: episode._id,
      TenTap: episode.TenTap,
      MaPhim: episode.MaPhim,
      duration: episode.duration || null,
      status: episode.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// POST /api/episodes/progress - Lưu tiến trình xem (resume)
// Body: { MaPhim, MaTap, ThoiGianXem }
// ============================================
router.post('/progress', protect, async (req, res) => {
  try {
    const { MaPhim, MaTap, ThoiGianXem } = req.body;
    if (!MaPhim) {
      return res.status(400).json({ message: 'MaPhim là bắt buộc' });
    }

    await LichSu.findOneAndUpdate(
      { UserID: req.user._id, MaPhim },
      {
        UserID: req.user._id,
        TenDN: req.user.ten_dang_nhap,
        MaPhim,
        MaTap: MaTap || undefined,
        ThoiGianXem: ThoiGianXem || 0,
        ThoiGian: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Đã lưu tiến trình' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// GET /api/episodes/progress/:movieId - Lấy tiến trình xem
// ============================================
router.get('/progress/:movieId', protect, async (req, res) => {
  try {
    const record = await LichSu.findOne({
      UserID: req.user._id,
      MaPhim: req.params.movieId
    });

    if (!record) {
      return res.json({ MaTap: null, ThoiGianXem: 0 });
    }

    res.json({
      MaTap: record.MaTap,
      ThoiGianXem: record.ThoiGianXem || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
