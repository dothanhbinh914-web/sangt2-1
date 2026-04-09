import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import API from '../../api/axios';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({
    TenPhim: '', TieuDe: '', MoTa: '', NoiDung: '', ThoiLuong: '',
    NamPhatHanh: '', PhanLoai: 'Lẻ', TinhTrang: 'Đang chiếu',
    HinhAnh: '', HinhAnhBanner: '', Link: '', MaQuocGia: '', TheLoai: []
  });

  const fetchMovies = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/movies?page=${page}&limit=10&search=${search}`);
      setMovies(res.data.movies);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Lỗi tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMovies();
    Promise.all([API.get('/genres'), API.get('/countries')])
      .then(([g, c]) => { setGenres(g.data); setCountries(c.data); })
      .catch(() => {});
  }, [fetchMovies]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenPhim) { toast.error('Tên phim không được trống'); return; }
    try {
      const data = {
        ...form,
        ThoiLuong: form.ThoiLuong ? parseInt(form.ThoiLuong) : undefined,
        NamPhatHanh: form.NamPhatHanh ? parseInt(form.NamPhatHanh) : undefined,
        MaQuocGia: form.MaQuocGia || undefined
      };
      if (editing) {
        await API.put(`/admin/movies/${editing._id}`, data);
        toast.success('Cập nhật phim thành công');
      } else {
        await API.post('/admin/movies', data);
        toast.success('Thêm phim thành công');
      }
      setShowModal(false);
      setEditing(null);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phim này?')) return;
    try {
      await API.delete(`/admin/movies/${id}`);
      toast.success('Đã xóa phim');
      fetchMovies();
    } catch {
      toast.error('Lỗi khi xóa phim');
    }
  };

  const openEdit = (movie) => {
    setEditing(movie);
    setForm({
      TenPhim: movie.TenPhim || '',
      TieuDe: movie.TieuDe || '',
      MoTa: movie.MoTa || '',
      NoiDung: movie.NoiDung || '',
      ThoiLuong: movie.ThoiLuong || '',
      NamPhatHanh: movie.NamPhatHanh || '',
      PhanLoai: movie.PhanLoai || 'Lẻ',
      TinhTrang: movie.TinhTrang || 'Đang chiếu',
      HinhAnh: movie.HinhAnh || '',
      HinhAnhBanner: movie.HinhAnhBanner || '',
      Link: movie.Link || '',
      MaQuocGia: movie.MaQuocGia?._id || '',
      TheLoai: movie.TheLoai?.map(t => t._id || t) || []
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      TenPhim: '', TieuDe: '', MoTa: '', NoiDung: '', ThoiLuong: '',
      NamPhatHanh: '', PhanLoai: 'Lẻ', TinhTrang: 'Đang chiếu',
      HinhAnh: '', HinhAnhBanner: '', Link: '', MaQuocGia: '', TheLoai: []
    });
    setShowModal(true);
  };

  const toggleGenre = (genreId) => {
    setForm(prev => ({
      ...prev,
      TheLoai: prev.TheLoai.includes(genreId)
        ? prev.TheLoai.filter(id => id !== genreId)
        : [...prev.TheLoai, genreId]
    }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý phim</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm phim..."
              className="bg-dark-100 text-white px-4 py-2 pl-9 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm w-48"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button onClick={openAdd} className="flex items-center space-x-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
            <FiPlus /> <span>Thêm phim</span>
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-dark-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Phim</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden md:table-cell">Quốc gia</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden lg:table-cell">Phân loại</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden md:table-cell">Trạng thái</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden lg:table-cell">Lượt xem</th>
                    <th className="text-right text-gray-400 px-4 py-3 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie._id} className="border-b border-gray-800/50 hover:bg-dark-400/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img src={movie.HinhAnh || 'https://picsum.photos/40/60'} alt="" className="w-10 h-14 object-cover rounded hidden sm:block" />
                          <div>
                            <p className="text-white font-medium truncate max-w-[200px]">{movie.TenPhim}</p>
                            <p className="text-xs text-gray-400">{movie.NamPhatHanh}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{movie.MaQuocGia?.TenQuocGia || '-'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs px-2 py-1 rounded ${movie.PhanLoai === 'Bộ' ? 'bg-blue-500/20 text-blue-400' : 'bg-primary/20 text-primary'}`}>
                          {movie.PhanLoai || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-1 rounded ${
                          movie.TinhTrang === 'Đang chiếu' ? 'bg-green-500/20 text-green-400' :
                          movie.TinhTrang === 'Sắp chiếu' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{movie.TinhTrang || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 hidden lg:table-cell">{movie.LuotXem?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openEdit(movie)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(movie._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={fetchMovies} />
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-100 rounded-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">{editing ? 'Sửa phim' : 'Thêm phim mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tên phim *</label>
                  <input type="text" value={form.TenPhim} onChange={e => setForm({...form, TenPhim: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tiêu đề phụ</label>
                  <input type="text" value={form.TieuDe} onChange={e => setForm({...form, TieuDe: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Năm phát hành</label>
                  <input type="number" value={form.NamPhatHanh} onChange={e => setForm({...form, NamPhatHanh: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Thời lượng (phút)</label>
                  <input type="number" value={form.ThoiLuong} onChange={e => setForm({...form, ThoiLuong: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phân loại</label>
                  <select value={form.PhanLoai} onChange={e => setForm({...form, PhanLoai: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm">
                    <option value="Lẻ">Phim Lẻ</option>
                    <option value="Bộ">Phim Bộ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tình trạng</label>
                  <select value={form.TinhTrang} onChange={e => setForm({...form, TinhTrang: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm">
                    <option value="Đang chiếu">Đang chiếu</option>
                    <option value="Sắp chiếu">Sắp chiếu</option>
                    <option value="Đã kết thúc">Đã kết thúc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Quốc gia</label>
                  <select value={form.MaQuocGia} onChange={e => setForm({...form, MaQuocGia: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm">
                    <option value="">Chọn quốc gia</option>
                    {countries.map(c => <option key={c._id} value={c._id}>{c.TenQuocGia}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Link video</label>
                  <input type="text" value={form.Link} onChange={e => setForm({...form, Link: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">URL hình ảnh poster</label>
                <input type="text" value={form.HinhAnh} onChange={e => setForm({...form, HinhAnh: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">URL hình ảnh banner</label>
                <input type="text" value={form.HinhAnhBanner} onChange={e => setForm({...form, HinhAnhBanner: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mô tả</label>
                <textarea rows={2} value={form.MoTa} onChange={e => setForm({...form, MoTa: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nội dung chi tiết</label>
                <textarea rows={3} value={form.NoiDung} onChange={e => setForm({...form, NoiDung: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Thể loại</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(g => (
                    <button key={g._id} type="button" onClick={() => toggleGenre(g._id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        form.TheLoai.includes(g._id) ? 'bg-primary border-primary text-white' : 'border-gray-700 text-gray-400 hover:border-primary'
                      }`}>{g.TenTheLoai}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-red-700 text-white rounded-lg text-sm transition">
                  {editing ? 'Cập nhật' : 'Thêm phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMovies;
