import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

function RegisterPage() {
  const [form, setForm] = useState({ ten_dang_nhap: '', email: '', mat_khau: '', ho_ten: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.ten_dang_nhap || !form.email || !form.mat_khau) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return;
    }
    if (form.mat_khau.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (form.mat_khau !== form.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'ho_ten', label: 'HỌ TÊN', type: 'text', placeholder: 'Họ và tên...', required: false },
    { name: 'ten_dang_nhap', label: 'TÊN ĐĂNG NHẬP *', type: 'text', placeholder: 'Tên đăng nhập...', required: true },
    { name: 'email', label: 'EMAIL *', type: 'email', placeholder: 'email@example.com', required: true },
  ];

  const passwordStrength = () => {
    const p = form.mat_khau;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = passwordStrength();
  const strengthColors = ['bg-zinc-700', 'bg-red-600', 'bg-orange-500', 'bg-yellow-400', 'bg-green-500', 'bg-green-400'];
  const strengthLabels = ['', 'YẾU', 'TRUNG BÌNH', 'KHÁ', 'MẠNH', 'RẤT MẠNH'];

  return (
    <div className="min-h-screen bg-dark-400 flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col flex-1 bg-black justify-between p-12 relative overflow-hidden border-r-4 border-white">
        <div className="absolute inset-0 stripe-bg opacity-10" />

        <Link to="/" className="relative z-10">
          <span className="font-brut font-black text-3xl text-white"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', letterSpacing: '-0.05em' }}>
            MOVIE<span className="text-red-600">FLIX</span>
          </span>
        </Link>

        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-4">— THAM GIA NGAY</p>
          <h1 className="font-brut font-black text-white uppercase leading-none mb-6"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.04em' }}>
            TẠO TÀI<br />KHOẢN<br /><span className="text-red-600">MIỄN PHÍ</span>
          </h1>

          {/* BENEFITS */}
          <div className="space-y-3">
            {['Xem phim chất lượng cao HD/4K', 'Lưu lịch sử xem phim', 'Tạo danh sách yêu thích', 'Nhận thông báo phim mới'].map(b => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-600 border-2 border-red-600 flex items-center justify-center flex-shrink-0">
                  <FiCheck size={10} className="text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 uppercase tracking-wide">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t-2 border-zinc-800 pt-6">
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
            ĐÃ CÓ TÀI KHOẢN?{' '}
            <Link to="/login" className="text-white border-b border-red-600 hover:text-red-500 transition-colors">
              ĐĂNG NHẬP
            </Link>
          </p>
        </div>

        <div className="absolute -right-16 bottom-0 font-brut font-black text-[18rem] text-white/5 select-none pointer-events-none leading-none"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
          +
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="flex-1 lg:max-w-lg flex flex-col justify-center px-8 md:px-16 py-12 overflow-y-auto">
        <Link to="/" className="lg:hidden mb-8">
          <span className="font-brut font-black text-2xl text-white"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
            MOVIE<span className="text-red-600">FLIX</span>
          </span>
        </Link>

        <div className="animate-slide-up">
          <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-2">— TẠO TÀI KHOẢN</p>
          <h2 className="font-brut font-black text-white uppercase mb-8"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
            ĐĂNG KÝ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label htmlFor={f.name} className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="input-brut"
                  placeholder={f.placeholder}
                />
              </div>
            ))}

            {/* PASSWORD */}
            <div>
              <label htmlFor="mat_khau" className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                MẬT KHẨU *
              </label>
              <div className="relative">
                <input
                  id="mat_khau"
                  type={showPass ? 'text' : 'password'}
                  name="mat_khau"
                  value={form.mat_khau}
                  onChange={handleChange}
                  className="input-brut pr-12"
                  placeholder="Ít nhất 6 ký tự..."
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {/* STRENGTH BAR */}
              {form.mat_khau && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className={`h-1 flex-1 transition-all duration-300 ${strength >= n ? strengthColors[strength] : 'bg-zinc-800'}`} />
                    ))}
                  </div>
                  <p className={`font-mono text-[10px] uppercase tracking-widest mt-1 ${strengthColors[strength].replace('bg-', 'text-')}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label htmlFor="confirmPassword" className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                XÁC NHẬN MẬT KHẨU *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`input-brut ${form.confirmPassword && form.mat_khau !== form.confirmPassword ? 'border-red-600' : form.confirmPassword && form.mat_khau === form.confirmPassword ? 'border-green-500' : ''}`}
                  placeholder="Nhập lại mật khẩu..."
                />
                {form.confirmPassword && form.mat_khau === form.confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                    <FiCheck size={16} />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brut w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <span className="font-mono text-xs tracking-widest">ĐANG XỬ LÝ...</span>
              ) : (
                <><FiArrowRight size={14} /> TẠO TÀI KHOẢN</>
              )}
            </button>
          </form>

          <p className="font-mono text-xs text-zinc-500 text-center mt-8">
            ĐÃ CÓ TÀI KHOẢN?{' '}
            <Link to="/login" className="font-black text-white border-b-2 border-red-600 hover:text-red-500 transition-colors uppercase tracking-wider">
              ĐĂNG NHẬP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
