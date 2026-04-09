import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import API from '../../api/axios';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

function AdminEpisodes() {
  const [episodes, setEpisodes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ MaPhim: '', TenTap: '', Link: '', hls_url: '', status: 'ready', duration: '' });

  const fetchEpisodes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (selectedMovie) params.set('movieId', selectedMovie);
      const res = await API.get(`/admin/episodes?${params}`);
      setEpisodes(res.data.episodes);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Lỗi tải danh sách tập phim');
    } finally {
      setLoading(false);
    }
  }, [selectedMovie]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  useEffect(() => {
    API.get('/admin/movies?limit=100').then(res => setMovies(res.data.movies)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.MaPhim || !form.TenTap) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    try {
      const data = { ...form, duration: form.duration ? parseInt(form.duration) : undefined };
      if (editing) {
        await API.put(`/admin/episodes/${editing._id}`, data);
        toast.success('Cập nhật tập phim thành công');
      } else {
        await API.post('/admin/episodes', data);
        toast.success('Thêm tập phim thành công');
      }
      setShowModal(false);
      setEditing(null);
      fetchEpisodes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tập phim này?')) return;
    try {
      await API.delete(`/admin/episodes/${id}`);
      toast.success('Đã xóa');
      fetchEpisodes();
    } catch { toast.error('Lỗi khi xóa'); }
  };

  const openEdit = (ep) => {
    setEditing(ep);
    setForm({
      MaPhim: ep.MaPhim?._id || ep.MaPhim || '',
      TenTap: ep.TenTap || '',
      Link: ep.Link || '',
      hls_url: ep.hls_url || '',
      status: ep.status || 'ready',
      duration: ep.duration || ''
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ MaPhim: selectedMovie || '', TenTap: '', Link: '', hls_url: '', status: 'ready', duration: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý tập phim</h2>
        <div className="flex items-center space-x-3">
          <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)}
            className="bg-dark-100 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm max-w-[200px]">
            <option value="">Tất cả phim</option>
            {movies.map(m => <option key={m._id} value={m._id}>{m.TenPhim}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center space-x-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
            <FiPlus /> <span>Thêm tập</span>
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
                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Tên tập</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden md:table-cell">Trạng thái</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden md:table-cell">Thời lượng</th>
                    <th className="text-right text-gray-400 px-4 py-3 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {episodes.map(ep => (
                    <tr key={ep._id} className="border-b border-gray-800/50 hover:bg-dark-400/50">
                      <td className="px-4 py-3 text-white">{ep.MaPhim?.TenPhim || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-300">{ep.TenTap}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-1 rounded ${
                          ep.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                          ep.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          ep.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{ep.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{ep.duration ? `${ep.duration} phút` : '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openEdit(ep)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><FiEdit2 size={16} /></button>
                          <button onClick={() => handleDelete(ep._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><FiTrash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={fetchEpisodes} />
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">{editing ? 'Sửa tập phim' : 'Thêm tập phim'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Phim *</label>
                <select value={form.MaPhim} onChange={e => setForm({...form, MaPhim: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm">
                  <option value="">Chọn phim</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.TenPhim}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tên tập *</label>
                <input type="text" value={form.TenTap} onChange={e => setForm({...form, TenTap: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm" placeholder="VD: Tập 1" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Link video</label>
                <input type="text" value={form.Link} onChange={e => setForm({...form, Link: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">HLS URL</label>
                <input type="text" value={form.hls_url} onChange={e => setForm({...form, hls_url: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Thời lượng (phút)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                    className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-red-700 text-white rounded-lg text-sm">{editing ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEpisodes;
