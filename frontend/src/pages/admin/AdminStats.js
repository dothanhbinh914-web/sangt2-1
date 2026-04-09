import React, { useEffect, useState } from 'react';
import { FiFilm, FiUsers, FiList, FiEye } from 'react-icons/fi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-gray-400">Không thể tải thống kê</p>;

  const cards = [
    { icon: FiFilm, label: 'Tổng phim', value: stats.totalMovies, color: 'bg-blue-500' },
    { icon: FiUsers, label: 'Người dùng', value: stats.totalUsers, color: 'bg-green-500' },
    { icon: FiList, label: 'Tổng tập phim', value: stats.totalEpisodes, color: 'bg-purple-500' },
    { icon: FiEye, label: 'Tổng lượt xem', value: stats.totalViews?.toLocaleString(), color: 'bg-primary' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Thống kê tổng quan</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-dark-100 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movies */}
        <div className="bg-dark-100 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Phim nổi bật (Top 10)</h3>
          <div className="space-y-3">
            {stats.topMovies?.map((movie, i) => (
              <div key={movie._id} className="flex items-center space-x-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 3 ? 'bg-primary text-white' : 'bg-dark-400 text-gray-400'
                }`}>{i + 1}</span>
                <img src={movie.HinhAnh || 'https://picsum.photos/40/60'} alt="" className="w-10 h-14 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{movie.TenPhim}</p>
                  <p className="text-xs text-gray-400">{movie.LuotXem?.toLocaleString()} lượt xem</p>
                </div>
                {movie.DanhGia > 0 && (
                  <span className="text-xs text-yellow-400">&#9733; {movie.DanhGia}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Genre Stats */}
        <div className="bg-dark-100 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Thống kê theo thể loại</h3>
          <div className="space-y-3">
            {stats.genreStats?.map((genre) => {
              const maxCount = stats.genreStats[0]?.count || 1;
              const percentage = Math.round((genre.count / maxCount) * 100);
              return (
                <div key={genre._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{genre.TenTheLoai}</span>
                    <span className="text-gray-400">{genre.count} phim</span>
                  </div>
                  <div className="w-full bg-dark-400 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-dark-100 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Người dùng mới</h3>
          <div className="space-y-3">
            {stats.recentUsers?.map(user => (
              <div key={user._id} className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-dark-300 flex items-center justify-center text-sm font-bold text-primary">
                  {user.ten_dang_nhap?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{user.ten_dang_nhap}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  user.vai_tro === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>{user.vai_tro}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;
