import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiLock, FiCamera, FiSave, FiKey,
  FiMousePointer, FiCheck,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CURSOR_COLORS = [
  { value: '#ffffff', label: 'Trắng' },
  { value: '#FF0000', label: 'Đỏ' },
  { value: '#FFE500', label: 'Vàng' },
  { value: '#00FF00', label: 'Xanh lá' },
  { value: '#00BFFF', label: 'Xanh dương' },
  { value: '#FF00FF', label: 'Tím' },
  { value: '#000000', label: 'Đen' },
];

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // ===== Cursor state =====
  const [cursorType, setCursorType] = useState(localStorage.getItem('cursorType') || 'crosshair');
  const [cursorColor, setCursorColor] = useState(localStorage.getItem('cursorColor') || '#ffffff');

  // ===== Profile form =====
  const [profileForm, setProfileForm] = useState({ ho_ten: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // ===== Password form =====
  const [passForm, setPassForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  // ===== Avatar =====
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // ===== Init =====
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfileForm({ ho_ten: user.ho_ten || '', email: user.email || '' });
  }, [user, navigate]);

  // ===== Cursor apply =====
  const applyCursor = (type, color) => {
    const plusSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
      <line x1='16' y1='2' x2='16' y2='30' stroke='#000' stroke-width='5' stroke-linecap='square'/>
      <line x1='2' y1='16' x2='30' y2='16' stroke='#000' stroke-width='5' stroke-linecap='square'/>
      <line x1='16' y1='2' x2='16' y2='30' stroke='${color}' stroke-width='3' stroke-linecap='square'/>
      <line x1='2' y1='16' x2='30' y2='16' stroke='${color}' stroke-width='3' stroke-linecap='square'/>
    </svg>`;
    const arrowSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
      <path d='M 5 3 L 5 23 L 12 16 L 17 28 L 20 27 L 15 15 L 25 15 Z' fill='${color}' stroke='#000' stroke-width='2'/>
    </svg>`;
    const svg = type === 'plus' ? plusSvg : arrowSvg;
    const hotspot = type === 'plus' ? '16 16' : '2 2';
    const fallback = type === 'plus' ? 'crosshair' : 'default';
    document.body.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspot}, ${fallback}`;
  };

  useEffect(() => {
    applyCursor(cursorType, cursorColor);
  }, []);

  const handleCursorType = (type) => {
    setCursorType(type);
    localStorage.setItem('cursorType', type);
    applyCursor(type, cursorColor);
  };

  const handleCursorColor = (color) => {
    setCursorColor(color);
    localStorage.setItem('cursorColor', color);
    applyCursor(cursorType, color);
  };

  // ===== Avatar select =====
  const handleSelectAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh quá lớn! Tối đa 2MB.');
      e.target.value = '';
      return;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận JPG, PNG, GIF, WEBP!');
      e.target.value = '';
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) { toast.error('Bạn chưa chọn ảnh!'); return; }
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('hinh_dai_dien_file', avatarFile);
      const res = await API.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data.user);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success(res.data.message || 'Cập nhật ảnh thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật ảnh!');
    } finally {
      setAvatarLoading(false);
    }
  };

  // ===== Update profile =====
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await API.put('/auth/profile', profileForm);
      updateUser(res.data.user);
      toast.success(res.data.message || 'Cập nhật thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setProfileLoading(false);
    }
  };

  // ===== Change password =====
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      const res = await API.put('/auth/change-password', passForm);
      toast.success(res.data.message || 'Đổi mật khẩu thành công!');
      setPassForm({ old_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) return null;

  const avatarSrc =
    avatarPreview ||
    (user.hinh_dai_dien
      ? user.hinh_dai_dien.startsWith('http')
        ? user.hinh_dai_dien
        : `${BASE_URL}${user.hinh_dai_dien}`
      : null);

  const initials = (user.ho_ten?.[0] || user.ten_dang_nhap?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-[#080808] py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ===== PAGE TITLE ===== */}
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-1">— HỒ SƠ</p>
          <h1
            className="font-black text-white uppercase leading-none"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}
          >
            TRANG CÁ NHÂN
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ===== LEFT COL: USER INFO ===== */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Avatar card */}
            <div className="border-2 border-white bg-[#111] p-6" style={{ boxShadow: '6px 6px 0 #FF0000' }}>
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-4">— THÔNG TIN</p>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-24 h-24 object-cover border-2 border-white"
                    style={{ boxShadow: '4px 4px 0 #FF0000' }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 bg-red-600 border-2 border-white flex items-center justify-center"
                    style={{ boxShadow: '4px 4px 0 #fff' }}
                  >
                    <span className="font-black text-white text-3xl" style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* User details */}
              <div className="space-y-3">
                <InfoRow label="TÊN ĐĂNG NHẬP" value={user.ten_dang_nhap} />
                <InfoRow label="HỌ TÊN" value={user.ho_ten || '—'} />
                <InfoRow label="EMAIL" value={user.email} />
                <InfoRow
                  label="VAI TRÒ"
                  value={user.vai_tro?.toUpperCase()}
                  highlight={user.vai_tro === 'admin'}
                />
              </div>
            </div>

            {/* Upload avatar card */}
            <div className="border-2 border-white bg-[#111] p-6" style={{ boxShadow: '6px 6px 0 #FF0000' }}>
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-4">— ĐỔI ẢNH</p>
              <form onSubmit={handleUploadAvatar} className="space-y-4">
                <label className="block border-2 border-dashed border-zinc-600 hover:border-white transition-colors cursor-pointer p-4 text-center">
                  <FiCamera className="mx-auto mb-2 text-zinc-500" size={24} />
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                    {avatarFile ? avatarFile.name : 'CHỌN ẢNH (TỐI ĐA 2MB)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectAvatar}
                  />
                </label>
                <button
                  type="submit"
                  disabled={avatarLoading || !avatarFile}
                  className="btn-brut w-full justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {avatarLoading ? 'ĐANG TẢI...' : <><FiCamera size={12} /> CẬP NHẬT ẢNH</>}
                </button>
              </form>
            </div>
          </div>

          {/* ===== RIGHT COL ===== */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Cursor settings */}
            <div className="border-2 border-white bg-[#111] p-6" style={{ boxShadow: '6px 6px 0 #FF0000' }}>
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-4">— CON TRỎ CHUỘT</p>
              <div className="flex gap-4 mb-5">
                <button
                  onClick={() => handleCursorType('default')}
                  className={`flex-1 py-3 border-2 font-black text-xs uppercase tracking-widest transition-all ${
                    cursorType === 'default'
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-zinc-600 text-zinc-400 hover:border-white hover:text-white'
                  }`}
                >
                  <FiMousePointer className="mx-auto mb-1" size={18} />
                  MŨI TÊN
                </button>
                <button
                  onClick={() => handleCursorType('plus')}
                  className={`flex-1 py-3 border-2 font-black text-xs uppercase tracking-widest transition-all ${
                    cursorType === 'plus'
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-zinc-600 text-zinc-400 hover:border-white hover:text-white'
                  }`}
                >
                  <span className="block text-xl leading-none mb-1">✚</span>
                  DẤU CỘNG
                </button>
              </div>

              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-3">MÀU CON TRỎ</p>
              <div className="flex gap-3 flex-wrap items-center">
                {CURSOR_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleCursorColor(value)}
                    title={label}
                    className="relative w-9 h-9 border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: value,
                      borderColor: cursorColor === value ? '#FF0000' : '#555',
                      boxShadow: cursorColor === value ? '3px 3px 0 #FF0000' : 'none',
                    }}
                  >
                    {cursorColor === value && (
                      <FiCheck
                        size={14}
                        className="absolute inset-0 m-auto"
                        style={{ color: value === '#ffffff' || value === '#FFE500' || value === '#00FF00' ? '#000' : '#fff' }}
                      />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={cursorColor}
                  onChange={(e) => handleCursorColor(e.target.value)}
                  title="Màu tùy chỉnh"
                  className="w-9 h-9 border-2 border-zinc-600 cursor-pointer bg-transparent p-0"
                />
              </div>
            </div>

            {/* Update profile */}
            <div className="border-2 border-white bg-[#111] p-6" style={{ boxShadow: '6px 6px 0 #FF0000' }}>
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-4">— CẬP NHẬT THÔNG TIN</p>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    <FiUser className="inline mr-1" size={12} /> HỌ TÊN
                  </label>
                  <input
                    type="text"
                    className="input-brut"
                    placeholder="Nhập họ tên..."
                    value={profileForm.ho_ten}
                    onChange={(e) => setProfileForm({ ...profileForm, ho_ten: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    <FiMail className="inline mr-1" size={12} /> EMAIL
                  </label>
                  <input
                    type="email"
                    className="input-brut"
                    placeholder="Nhập email..."
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-brut w-full justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {profileLoading ? 'ĐANG LƯU...' : <><FiSave size={12} /> LƯU THÔNG TIN</>}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="border-2 border-white bg-[#111] p-6" style={{ boxShadow: '6px 6px 0 #FF0000' }}>
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-4">— ĐỔI MẬT KHẨU</p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <PasswordField
                  label="MẬT KHẨU CŨ"
                  name="old"
                  value={passForm.old_password}
                  show={showPass.old}
                  onToggle={() => setShowPass((p) => ({ ...p, old: !p.old }))}
                  onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })}
                />
                <PasswordField
                  label="MẬT KHẨU MỚI"
                  name="new"
                  value={passForm.new_password}
                  show={showPass.new}
                  onToggle={() => setShowPass((p) => ({ ...p, new: !p.new }))}
                  onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
                />
                <PasswordField
                  label="XÁC NHẬN MẬT KHẨU"
                  name="confirm"
                  value={passForm.new_password_confirmation}
                  show={showPass.confirm}
                  onToggle={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}
                  onChange={(e) => setPassForm({ ...passForm, new_password_confirmation: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={passLoading}
                  className="btn-brut w-full justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {passLoading ? 'ĐANG XỬ LÝ...' : <><FiKey size={12} /> ĐỔI MẬT KHẨU</>}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
      <p
        className={`font-black text-sm uppercase truncate ${highlight ? 'text-yellow-400' : 'text-white'}`}
        style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
      >
        {value}
      </p>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
        <FiLock className="inline mr-1" size={12} /> {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          className="input-brut pr-12"
          placeholder="••••••••"
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          {show ? 'ẨN' : 'HIỆN'}
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
