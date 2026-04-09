# MovieFlix - Web Xem Phim Fullstack

Ứng dụng web xem phim fullstack theo phong cách Netflix, xây dựng với React + Express + MongoDB.

---

## Mục lục

- [Tech Stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt & Chạy](#cài-đặt--chạy)
- [Biến môi trường](#biến-môi-trường)
- [Chức năng](#chức-năng)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Tài khoản mặc định](#tài-khoản-mặc-định)

---

## Tech Stack

| Phần         | Công nghệ                                          |
|--------------|----------------------------------------------------|
| Frontend     | React 19, React Router v7, TailwindCSS v3, hls.js  |
| Backend      | Node.js, Express 4, Mongoose 8                     |
| Database     | MongoDB (`webapixemphim`)                          |
| Auth         | JWT (jsonwebtoken + bcryptjs)                      |
| Video        | hls.js, Cloudflare Stream                          |
| UI Library   | react-icons, react-toastify                        |
| Dev Tools    | nodemon, Create React App (react-scripts 5)        |

---

## Cấu trúc dự án

```
movie-app/
├── backend/
│   ├── bin/www                  # Entry point (HTTP server)
│   ├── app.js                   # Express app config, route mounting
│   ├── .env                     # Biến môi trường
│   ├── seed.js                  # Script tạo dữ liệu mẫu
│   ├── middleware/
│   │   └── auth.js              # JWT protect, adminOnly, generateToken
│   ├── models/                  # Mongoose models
│   │   ├── TaiKhoan.js          # Người dùng (tai_khoan)
│   │   ├── Phim.js              # Phim (phim)
│   │   ├── TapPhim.js           # Tập phim (tapphim)
│   │   ├── TheLoai.js           # Thể loại (theloai)
│   │   ├── QuocGia.js           # Quốc gia (quocgia)
│   │   ├── DienVien.js          # Diễn viên (dien_vien)
│   │   ├── DaoDien.js           # Đạo diễn (dao_dien)
│   │   ├── LichSu.js            # Lịch sử xem (lich_su)
│   │   ├── DanhGia.js           # Đánh giá (danh_gia)
│   │   ├── BinhLuan.js          # Bình luận (binh_luan)
│   │   └── PhimYeuThich.js      # Phim yêu thích (phim_yeu_thich)
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── movieRoutes.js       # /api/movies
│   │   ├── episodeRoutes.js     # /api/episodes
│   │   ├── genreRoutes.js       # /api/genres
│   │   ├── countryRoutes.js     # /api/countries
│   │   └── adminRoutes.js       # /api/admin
│   └── utils/
│       └── db.js                # Kết nối MongoDB + xóa $jsonSchema validators
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── tailwind.config.js       # Custom colors (primary, dark-100~500)
    ├── src/
    │   ├── index.css            # Tailwind directives + scrollbar styles
    │   ├── App.js               # Routing chính
    │   ├── api/
    │   │   └── axios.js         # Axios instance + JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.js   # Auth state (login/register/logout/isAdmin)
    │   ├── components/
    │   │   ├── Navbar.js        # Thanh điều hướng (search, filter, user menu)
    │   │   ├── MovieCard.js     # Card phim
    │   │   ├── Pagination.js    # Phân trang
    │   │   ├── LoadingSpinner.js
    │   │   ├── ProtectedRoute.js
    │   │   └── UserLayout.js    # Layout với Navbar + <Outlet />
    │   └── pages/
    │       ├── HomePage.js          # Trang chủ
    │       ├── MovieDetail.js       # Chi tiết phim
    │       ├── WatchPage.js         # Trang xem phim (video player)
    │       ├── FilterPage.js        # Lọc / tìm kiếm phim
    │       ├── LoginPage.js
    │       ├── RegisterPage.js
    │       ├── ForgotPasswordPage.js
    │       └── admin/
    │           ├── AdminLayout.js   # Sidebar admin
    │           ├── AdminStats.js    # Dashboard thống kê
    │           ├── AdminMovies.js   # Quản lý phim
    │           ├── AdminEpisodes.js # Quản lý tập phim
    │           ├── AdminUsers.js    # Quản lý người dùng
    │           ├── AdminGenres.js   # Quản lý thể loại
    │           └── AdminCountries.js# Quản lý quốc gia
```

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- MongoDB đang chạy (local hoặc Atlas)
- Database name: `webapixemphim`

### 1. Backend

```bash
cd backend
npm install
# Tạo file .env (xem mục Biến môi trường)
npm run dev        # nodemon bin/www, port 5000
```

#### Seed dữ liệu mẫu

```bash
cd backend
npm run seed
```

Seed tạo:
- 10 thể loại, 8 quốc gia
- 12 phim mẫu, 49 tập phim
- 2 tài khoản: `admin / admin123` và `user1 / user123`

### 2. Frontend

```bash
cd frontend
npm install
npm start          # CRA dev server, port 3000
```

---

## Biến môi trường

Tạo file `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/webapixemphim
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
PORT=5000

# Cloudflare Stream (nếu dùng)
CLOUDFLARE_CUSTOMER_CODE=f33zs165nr7gyfy4
```

---

## Chức năng

### Phía người dùng (User)

#### Trang chủ (`/`)
- Banner carousel phim nổi bật (top lượt xem)
- Section "Tiếp tục xem" — lịch sử xem gần nhất (cần đăng nhập)
- Danh sách phim phân trang với MovieCard
- Nút chuyển trang

#### Tìm kiếm & Lọc (`/filter`)
- Tìm theo tên phim
- Lọc theo thể loại, quốc gia, năm phát hành
- Kết quả phân trang

#### Chi tiết phim (`/movie/:id`)
- Thông tin đầy đủ: tên, mô tả, thể loại, quốc gia, năm, thời lượng, đánh giá, lượt xem
- Danh sách diễn viên, đạo diễn
- Danh sách tập phim (click để xem)
- Tự động tăng lượt xem khi vào trang

#### Xem phim (`/watch/:id?tap=<episodeId>`)
Video player tùy chỉnh hoàn toàn với các tính năng:

| Tính năng | Mô tả |
|-----------|-------|
| HLS Playback | hls.js với ưu tiên: `hls_url` > Cloudflare UID build URL > MP4 link |
| Chọn chất lượng | Dropdown Auto/360p/480p/720p/1080p với bitrate, badge HD/4K |
| Nhớ chất lượng | Lưu vào localStorage (`preferredQuality`) |
| Resume xem | Tự động quay lại vị trí đã xem (cần đăng nhập) |
| Lưu tiến trình | Tự động lưu mỗi 15 giây |
| Tự động phát tập tiếp | Đếm ngược 5 giây rồi chuyển sang tập kế |
| Custom controls | Play/pause, seek bar (với buffered), volume slider, fullscreen |
| Auto-hide controls | Ẩn sau 3 giây không di chuyển chuột |
| Loading indicator | Hiển thị khi đang chuyển chất lượng |

#### Xác thực
- Đăng ký tài khoản
- Đăng nhập (username hoặc email)
- Quên mật khẩu (endpoint sẵn sàng, cần cấu hình email)
- JWT tự động gắn vào mọi request qua Axios interceptor
- Tự động redirect về `/login` khi token hết hạn (401)

---

### Phía Admin (`/admin`)

Truy cập yêu cầu tài khoản có `vai_tro: "admin"`.

#### Dashboard thống kê (`/admin`)
- Tổng phim, người dùng, tập phim, lượt xem
- Top 10 phim nhiều lượt xem nhất
- 5 người dùng mới nhất
- Thống kê phim theo thể loại

#### Quản lý phim (`/admin/movies`)
- Danh sách phân trang + tìm kiếm theo tên
- Thêm / Sửa phim (form đầy đủ: tên, mô tả, hình ảnh, năm, thời lượng, thể loại, quốc gia)
- Xóa phim (tự động xóa toàn bộ tập phim liên quan)

#### Quản lý tập phim (`/admin/episodes`)
- Lọc theo phim
- Thêm / Sửa tập (hỗ trợ hls_url, cloudflare_uid, Link MP4)
- Xóa tập

#### Quản lý người dùng (`/admin/users`)
- Danh sách phân trang + tìm kiếm
- Cập nhật vai trò (user/admin/moderator)
- Cập nhật trạng thái (active/inactive/banned)
- Xóa tài khoản

#### Quản lý thể loại (`/admin/genres`)
- CRUD thể loại phim

#### Quản lý quốc gia (`/admin/countries`)
- CRUD quốc gia

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint              | Auth | Mô tả                    |
|--------|-----------------------|------|--------------------------|
| POST   | `/register`           | -    | Đăng ký tài khoản        |
| POST   | `/login`              | -    | Đăng nhập, trả về JWT    |
| POST   | `/forgot-password`    | -    | Yêu cầu reset mật khẩu  |
| GET    | `/me`                 | JWT  | Lấy thông tin bản thân   |
| PUT    | `/profile`            | JWT  | Cập nhật ho_ten, avatar  |

### Movies — `/api/movies`

| Method | Endpoint               | Auth | Mô tả                               |
|--------|------------------------|------|-------------------------------------|
| GET    | `/`                    | -    | Danh sách phim (phân trang)         |
| GET    | `/featured`            | -    | Phim nổi bật (top lượt xem)         |
| GET    | `/search?q=&page=`     | -    | Tìm kiếm theo tên                   |
| GET    | `/filter?quocgia=...`  | -    | Lọc theo quốc gia/thể loại/năm      |
| GET    | `/history`             | JWT  | Lịch sử xem của user                |
| GET    | `/:id`                 | -    | Chi tiết phim (tăng lượt xem +1)    |
| POST   | `/:id/history`         | JWT  | Lưu lịch sử xem                     |

### Episodes — `/api/episodes`

| Method | Endpoint                   | Auth | Mô tả                          |
|--------|----------------------------|------|--------------------------------|
| GET    | `/:movieId`                | -    | Tất cả tập của phim            |
| GET    | `/detail/:id`              | -    | Chi tiết 1 tập                 |
| GET    | `/play/:id`                | -    | Lấy URL video (HLS hoặc MP4)   |
| POST   | `/progress`                | JWT  | Lưu tiến trình xem             |
| GET    | `/progress/:movieId`       | JWT  | Lấy tiến trình xem             |

**Logic URL video** (`GET /play/:id`):
1. `hls_url` có sẵn → trả về trực tiếp (type: HLS)
2. `cloudflare_uid` → build URL `https://customer-{code}.cloudflarestream.com/{uid}/manifest/video.m3u8` (type: HLS)
3. `Link` → MP4 trực tiếp (type: MP4)

### Genres — `/api/genres`

| Method | Endpoint | Auth | Mô tả             |
|--------|----------|------|-------------------|
| GET    | `/`      | -    | Danh sách thể loại|

### Countries — `/api/countries`

| Method | Endpoint | Auth | Mô tả            |
|--------|----------|------|------------------|
| GET    | `/`      | -    | Danh sách quốc gia|

### Admin — `/api/admin` (JWT + admin role)

| Method | Endpoint            | Mô tả                          |
|--------|---------------------|--------------------------------|
| GET    | `/stats`            | Thống kê tổng quan             |
| GET    | `/movies`           | Danh sách phim (admin view)    |
| POST   | `/movies`           | Thêm phim mới                  |
| PUT    | `/movies/:id`       | Cập nhật phim                  |
| DELETE | `/movies/:id`       | Xóa phim + toàn bộ tập         |
| GET    | `/episodes`         | Danh sách tập phim             |
| POST   | `/episodes`         | Thêm tập phim                  |
| PUT    | `/episodes/:id`     | Cập nhật tập phim              |
| DELETE | `/episodes/:id`     | Xóa tập phim                   |
| GET    | `/users`            | Danh sách người dùng           |
| PUT    | `/users/:id`        | Cập nhật vai_tro / trang_thai  |
| DELETE | `/users/:id`        | Xóa người dùng                 |
| GET    | `/genres`           | Danh sách thể loại             |
| POST   | `/genres`           | Thêm thể loại                  |
| PUT    | `/genres/:id`       | Cập nhật thể loại              |
| DELETE | `/genres/:id`       | Xóa thể loại                   |
| GET    | `/countries`        | Danh sách quốc gia             |
| POST   | `/countries`        | Thêm quốc gia                  |
| PUT    | `/countries/:id`    | Cập nhật quốc gia              |
| DELETE | `/countries/:id`    | Xóa quốc gia                   |

---

## Database Schema

Database: `webapixemphim`

### tai_khoan (TaiKhoan)
```
_id, ten_dang_nhap, mat_khau (bcrypt), email, ho_ten,
hinh_dai_dien, vai_tro (user|admin|moderator),
trang_thai (active|inactive|banned), ngay_tao, ngay_cap_nhat
```

### phim (Phim)
```
_id, TenPhim, MoTa, HinhAnh, Trailer, NamPhatHanh,
ThoiLuong, TrangThai, LuotXem, DanhGia,
MaQuocGia (ref: quocgia), TheLoai[] (ref: theloai),
DienVien[] (ref: dien_vien), DaoDien[] (ref: dao_dien),
NgayTao, NgayCapNhat
```

### tapphim (TapPhim)
```
_id, MaPhim (ref: phim), TenTap, MoTa,
Link (MP4 URL), hls_url (HLS manifest URL),
cloudflare_uid (Cloudflare Stream UID),
duration, status, NgayTao
```

### lich_su (LichSu)
```
_id, UserID (ref: tai_khoan), TenDN, MaPhim (ref: phim),
MaTap (ref: tapphim), ThoiGianXem (giây), ThoiGian
```

### theloai, quocgia, dien_vien, dao_dien
```
Các collection metadata với TenXxx, MoTa, HinhAnh (nếu có)
```

---

## Tài khoản mặc định

Sau khi chạy `npm run seed`:

| Tài khoản | Mật khẩu  | Vai trò |
|-----------|-----------|---------|
| admin     | admin123  | admin   |
| user1     | user123   | user    |

---

## Lưu ý kỹ thuật

### MongoDB Validators
Database được tạo bởi script ngoài (`mongodb_webapixemphim.js`) có chứa `$jsonSchema` validators nghiêm ngặt.
`backend/utils/db.js` tự động xóa validators này khi khởi động để Mongoose có thể insert/update dữ liệu bình thường.

### Populate dependencies
`movieRoutes.js` và `adminRoutes.js` phải `require()` các model phụ trợ (TheLoai, QuocGia, DienVien, DaoDien) dù không dùng trực tiếp — Mongoose cần chúng đã được đăng ký để `populate()` hoạt động.

### HLS Quality Selection
WatchPage sử dụng `hls.levels` sau sự kiện `MANIFEST_PARSED` để build danh sách chất lượng.
- `hls.currentLevel = -1` → Auto (ABR)
- `hls.currentLevel = index` → Cố định chất lượng
- `LEVEL_SWITCHING` / `LEVEL_SWITCHED` → Hiển thị loading indicator
- `FRAG_BUFFERED` → Cập nhật nhãn "Auto (720p)" theo chất lượng đang thực tế phát

### Axios Interceptor
`frontend/src/api/axios.js` tự động:
1. Gắn `Authorization: Bearer <token>` vào mọi request
2. Redirect về `/login` và xóa token khi nhận 401
