import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import API from '../../api/axios';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vai_tro: 'user', trang_thai: 'active' });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/users?page=${page}&limit=10&search=${search}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error('Lỗi tải danh sách người dùng'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/users/${editing._id}`, form);
      toast.success('Cập nhật thành công');
      setShowModal(false);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa người dùng này?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('Đã xóa');
      fetchUsers();
    } catch { toast.error('Lỗi khi xóa'); }
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ vai_tro: user.vai_tro, trang_thai: user.trang_thai });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý người dùng</h2>
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm người dùng..."
            className="bg-dark-100 text-white px-4 py-2 pl-9 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm w-56" />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-dark-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Người dùng</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Vai trò</th>
                    <th className="text-left text-gray-400 px-4 py-3 font-medium">Trạng thái</th>
                    <th className="text-right text-gray-400 px-4 py-3 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-gray-800/50 hover:bg-dark-400/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-dark-300 flex items-center justify-center text-sm font-bold text-primary">
                            {user.ten_dang_nhap?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.ho_ten || user.ten_dang_nhap}</p>
                            <p className="text-xs text-gray-400">@{user.ten_dang_nhap}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.vai_tro === 'admin' ? 'bg-yellow-500/20 text-yellow-400' :
                          user.vai_tro === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{user.vai_tro}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.trang_thai === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.trang_thai === 'banned' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{user.trang_thai}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openEdit(user)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><FiEdit2 size={16} /></button>
                          <button onClick={() => handleDelete(user._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><FiTrash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={fetchUsers} />
        </>
      )}

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Chỉnh sửa: {editing.ten_dang_nhap}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Vai trò</label>
                <select value={form.vai_tro} onChange={e => setForm({...form, vai_tro: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm">
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Trạng thái</label>
                <select value={form.trang_thai} onChange={e => setForm({...form, trang_thai: e.target.value})}
                  className="w-full bg-dark-400 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-red-700 text-white rounded-lg text-sm">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
