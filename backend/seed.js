require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const QuocGia = require('./models/QuocGia');
const TheLoai = require('./models/TheLoai');
const TaiKhoan = require('./models/TaiKhoan');
const Phim = require('./models/Phim');
const TapPhim = require('./models/TapPhim');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    QuocGia.deleteMany({}),
    TheLoai.deleteMany({}),
    TaiKhoan.deleteMany({}),
    Phim.deleteMany({}),
    TapPhim.deleteMany({})
  ]);

  // Quốc gia
  const countries = await QuocGia.insertMany([
    { TenQuocGia: 'Việt Nam' },
    { TenQuocGia: 'Hàn Quốc' },
    { TenQuocGia: 'Nhật Bản' },
    { TenQuocGia: 'Trung Quốc' },
    { TenQuocGia: 'Mỹ' },
    { TenQuocGia: 'Thái Lan' },
    { TenQuocGia: 'Ấn Độ' },
    { TenQuocGia: 'Anh' }
  ]);
  console.log('Created countries');

  // Thể loại
  const genres = await TheLoai.insertMany([
    { TenTheLoai: 'Hành Động' },
    { TenTheLoai: 'Tình Cảm' },
    { TenTheLoai: 'Hài Hước' },
    { TenTheLoai: 'Kinh Dị' },
    { TenTheLoai: 'Viễn Tưởng' },
    { TenTheLoai: 'Hoạt Hình' },
    { TenTheLoai: 'Tâm Lý' },
    { TenTheLoai: 'Phiêu Lưu' },
    { TenTheLoai: 'Cổ Trang' },
    { TenTheLoai: 'Hình Sự' }
  ]);
  console.log('Created genres');

  // Admin account
  await TaiKhoan.create({
    ten_dang_nhap: 'admin',
    mat_khau: 'admin123',
    email: 'admin@movieflix.com',
    ho_ten: 'Administrator',
    vai_tro: 'admin',
    trang_thai: 'active'
  });

  // User account
  await TaiKhoan.create({
    ten_dang_nhap: 'user1',
    mat_khau: 'user123',
    email: 'user1@movieflix.com',
    ho_ten: 'Nguyen Van A',
    vai_tro: 'user',
    trang_thai: 'active'
  });
  console.log('Created accounts');

  // Phim mẫu
  const movieData = [
    {
      TenPhim: 'Đất Rừng Phương Nam',
      TieuDe: 'Dat Rung Phuong Nam',
      MoTa: 'Bộ phim kể về cuộc phiêu lưu của cậu bé An trên vùng đất phương Nam.',
      NoiDung: 'Câu chuyện về cậu bé An lưu lạc qua nhiều vùng đất khác nhau ở miền Tây Nam Bộ, gặp gỡ nhiều người và học được nhiều bài học cuộc sống quý giá.',
      ThoiLuong: 120, NamPhatHanh: 2023, DanhGia: 8.5, LuotXem: 15000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie1/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner1/1200/500',
      MaQuocGia: countries[0]._id,
      TheLoai: [genres[7]._id, genres[2]._id]
    },
    {
      TenPhim: 'Squid Game Season 2',
      TieuDe: 'Tro Choi Con Muc 2',
      MoTa: 'Phần tiếp theo của loạt phim đình đám Squid Game.',
      NoiDung: 'Gi-hun quay trở lại trò chơi với mục đích phá hủy nó từ bên trong. Anh phải đối mặt với những thử thách mới và nguy hiểm hơn.',
      ThoiLuong: 55, NamPhatHanh: 2024, DanhGia: 9.0, LuotXem: 50000,
      TinhTrang: 'Đang chiếu', PhanLoai: 'Bộ',
      HinhAnh: 'https://picsum.photos/seed/movie2/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner2/1200/500',
      MaQuocGia: countries[1]._id,
      TheLoai: [genres[0]._id, genres[6]._id]
    },
    {
      TenPhim: 'One Piece Film Red',
      TieuDe: 'One Piece Film Red',
      MoTa: 'Cuộc phiêu lưu mới của Luffy và băng Mũ Rơm.',
      NoiDung: 'Luffy và băng Mũ Rơm tham dự buổi hòa nhạc của Uta - ca sĩ nổi tiếng nhất thế giới, con gái của Shanks Tóc Đỏ.',
      ThoiLuong: 115, NamPhatHanh: 2023, DanhGia: 8.8, LuotXem: 35000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie3/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner3/1200/500',
      MaQuocGia: countries[2]._id,
      TheLoai: [genres[5]._id, genres[7]._id, genres[0]._id]
    },
    {
      TenPhim: 'Hạ Cánh Nơi Anh',
      TieuDe: 'Crash Landing On You',
      MoTa: 'Câu chuyện tình yêu giữa một nữ tài phiệt Hàn Quốc và sĩ quan Bắc Hàn.',
      NoiDung: 'Yoon Se-ri, nữ thừa kế giàu có, gặp tai nạn dù lượn và hạ cánh xuống Bắc Triều Tiên, nơi cô gặp Ri Jung-hyuk.',
      ThoiLuong: 70, NamPhatHanh: 2020, DanhGia: 9.2, LuotXem: 80000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Bộ',
      HinhAnh: 'https://picsum.photos/seed/movie4/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner4/1200/500',
      MaQuocGia: countries[1]._id,
      TheLoai: [genres[1]._id, genres[6]._id]
    },
    {
      TenPhim: 'Avengers: Endgame',
      TieuDe: 'Avengers: Endgame',
      MoTa: 'Trận chiến cuối cùng của các siêu anh hùng Avengers.',
      NoiDung: 'Sau sự kiện tàn khốc của Thanos, các Avengers còn lại phải tìm cách đảo ngược mọi thứ và khôi phục trật tự vũ trụ.',
      ThoiLuong: 182, NamPhatHanh: 2019, DanhGia: 9.5, LuotXem: 120000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie5/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner5/1200/500',
      MaQuocGia: countries[4]._id,
      TheLoai: [genres[0]._id, genres[4]._id, genres[7]._id]
    },
    {
      TenPhim: 'Tấm Cám: Chuyện Chưa Kể',
      TieuDe: 'Tam Cam Chuyen Chua Ke',
      MoTa: 'Phiên bản điện ảnh của câu chuyện cổ tích Tấm Cám.',
      NoiDung: 'Câu chuyện Tấm Cám được kể lại theo phong cách điện ảnh hiện đại với nhiều tình tiết mới lạ và hấp dẫn.',
      ThoiLuong: 100, NamPhatHanh: 2022, DanhGia: 7.5, LuotXem: 8000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie6/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner6/1200/500',
      MaQuocGia: countries[0]._id,
      TheLoai: [genres[1]._id, genres[8]._id]
    },
    {
      TenPhim: 'Doraemon: Nobita và Vùng Đất Lý Tưởng',
      TieuDe: 'Doraemon Movie 2023',
      MoTa: 'Cuộc phiêu lưu mới nhất của Doraemon và nhóm bạn.',
      NoiDung: 'Nobita và nhóm bạn cùng Doraemon khám phá một vùng đất bí ẩn nơi mọi thứ đều hoàn hảo, nhưng ẩn chứa nhiều bí mật.',
      ThoiLuong: 108, NamPhatHanh: 2023, DanhGia: 8.0, LuotXem: 25000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie7/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner7/1200/500',
      MaQuocGia: countries[2]._id,
      TheLoai: [genres[5]._id, genres[7]._id]
    },
    {
      TenPhim: 'Itaewon Class',
      TieuDe: 'Itaewon Class',
      MoTa: 'Câu chuyện về chàng trai trẻ mở nhà hàng tại Itaewon.',
      NoiDung: 'Park Sae-ro-yi mở nhà hàng nhỏ tại Itaewon sau khi bị đuổi học và cha bị hại chết, bắt đầu hành trình trả thù.',
      ThoiLuong: 65, NamPhatHanh: 2020, DanhGia: 8.7, LuotXem: 45000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Bộ',
      HinhAnh: 'https://picsum.photos/seed/movie8/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner8/1200/500',
      MaQuocGia: countries[1]._id,
      TheLoai: [genres[6]._id, genres[1]._id]
    },
    {
      TenPhim: 'Lật Mặt 6',
      TieuDe: 'Lat Mat 6',
      MoTa: 'Phần mới nhất trong series phim Lật Mặt của Lý Hải.',
      NoiDung: 'Câu chuyện về tình cảm gia đình, sự hy sinh và lòng dũng cảm trong bối cảnh đầy kịch tính và hành động.',
      ThoiLuong: 132, NamPhatHanh: 2023, DanhGia: 7.8, LuotXem: 18000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie9/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner9/1200/500',
      MaQuocGia: countries[0]._id,
      TheLoai: [genres[0]._id, genres[2]._id]
    },
    {
      TenPhim: 'Thần Thám Địch Nhân Kiệt',
      TieuDe: 'Detective Dee',
      MoTa: 'Phim cổ trang trinh thám Trung Quốc.',
      NoiDung: 'Địch Nhân Kiệt, vị quan thông minh nhất triều đại nhà Đường, phá giải những vụ án bí ẩn và phức tạp.',
      ThoiLuong: 60, NamPhatHanh: 2024, DanhGia: 8.3, LuotXem: 30000,
      TinhTrang: 'Đang chiếu', PhanLoai: 'Bộ',
      HinhAnh: 'https://picsum.photos/seed/movie10/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner10/1200/500',
      MaQuocGia: countries[3]._id,
      TheLoai: [genres[8]._id, genres[9]._id]
    },
    {
      TenPhim: 'The Witcher Season 3',
      TieuDe: 'The Witcher 3',
      MoTa: 'Geralt of Rivia tiếp tục hành trình bảo vệ Ciri.',
      NoiDung: 'Geralt phải đối mặt với những mối đe dọa mới khi các thế lực đều muốn bắt giữ Ciri vì sức mạnh bí ẩn của cô.',
      ThoiLuong: 58, NamPhatHanh: 2023, DanhGia: 8.1, LuotXem: 40000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Bộ',
      HinhAnh: 'https://picsum.photos/seed/movie11/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner11/1200/500',
      MaQuocGia: countries[4]._id,
      TheLoai: [genres[4]._id, genres[0]._id]
    },
    {
      TenPhim: 'Gia Tài Của Ngoại',
      TieuDe: 'How To Make Millions Before Grandma Dies',
      MoTa: 'Bộ phim cảm động về tình cảm gia đình.',
      NoiDung: 'Câu chuyện về M - chàng trai trẻ quyết định chăm sóc bà ngoại bị ung thư với hy vọng được thừa kế tài sản.',
      ThoiLuong: 126, NamPhatHanh: 2024, DanhGia: 9.1, LuotXem: 60000,
      TinhTrang: 'Đã kết thúc', PhanLoai: 'Lẻ',
      HinhAnh: 'https://picsum.photos/seed/movie12/300/450',
      HinhAnhBanner: 'https://picsum.photos/seed/banner12/1200/500',
      MaQuocGia: countries[5]._id,
      TheLoai: [genres[1]._id, genres[6]._id]
    }
  ];

  const movies = await Phim.insertMany(movieData);
  console.log('Created movies');

  // Tập phim cho phim bộ
  const episodesData = [];
  movies.forEach(movie => {
    if (movie.PhanLoai === 'Bộ') {
      const numEps = Math.floor(Math.random() * 12) + 4;
      for (let i = 1; i <= numEps; i++) {
        episodesData.push({
          MaPhim: movie._id,
          TenTap: `Tập ${i}`,
          Link: `https://example.com/video/${movie._id}/ep${i}`,
          status: 'ready',
          duration: Math.floor(Math.random() * 30) + 40
        });
      }
    }
  });
  await TapPhim.insertMany(episodesData);
  console.log('Created episodes');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Admin: admin / admin123');
  console.log('User: user1 / user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
