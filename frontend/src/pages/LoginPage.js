import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenDangNhap || !matKhau) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setLoading(true);
    try {
      await login(tenDangNhap, matKhau);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 flex">

      {/* LEFT — BOLD STATEMENT */}
      <div className="hidden lg:flex flex-1 bg-red-600 flex-col justify-between p-12 relative overflow-hidden border-r-4 border-white">
        {/* DIAGONAL STRIPE BG */}
        <div className="absolute inset-0 stripe-bg opacity-20" />

        {/* LOGO */}
        <Link to="/" className="relative z-10">
          <span className="font-brut font-black text-3xl text-white uppercase tracking-tighter"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', letterSpacing: '-0.05em' }}>
            MOVIE<span className="text-black">FLIX</span>
          </span>
        </Link>

        {/* BIG TEXT */}
        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest text-red-200 mb-4">— CHÀO MỪNG TRỞ LẠI</p>
          <h1 className="font-brut font-black text-white uppercase leading-none mb-6"
            style={{
              fontFamily: '"Arial Black", Impact, sans-serif',
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              letterSpacing: '-0.04em',
              textShadow: '6px 6px 0 rgba(0,0,0,0.3)',
            }}>
            XEM<br />PHIM<br />KHÔNG<br />GIỚI HẠN
          </h1>
          <p className="font-mono text-sm text-red-100 max-w-xs leading-relaxed">
            Hàng nghìn bộ phim, phim bộ đang chờ bạn khám phá. Đăng nhập ngay.
          </p>
        </div>

        {/* BOTTOM STATS */}
        <div className="relative z-10 flex gap-8">
          {[['1000+', 'PHIM'], ['HD', 'CHẤT LƯỢNG'], ['FREE', 'MIỄN PHÍ']].map(([num, label]) => (
            <div key={label}>
              <div className="font-brut font-black text-2xl text-white"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>{num}</div>
              <div className="font-mono text-xs text-red-200 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        {/* DECORATIVE NUMBER */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 font-brut font-black text-[20rem] text-black/10 select-none pointer-events-none leading-none"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
          ▶
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="flex-1 lg:max-w-lg flex flex-col justify-center px-8 md:px-16 py-12">
        {/* MOBILE LOGO */}
        <Link to="/" className="lg:hidden mb-10">
          <span className="font-brut font-black text-2xl text-white"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
            MOVIE<span className="text-red-600">FLIX</span>
          </span>
        </Link>

        <div className="animate-slide-up">
          <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-2">— ĐĂNG NHẬP</p>
          <h2 className="font-brut font-black text-white uppercase mb-8"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
            CHÀO<br />MỪNG BẠN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* USERNAME */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                TÊN ĐĂNG NHẬP / EMAIL
              </label>
              <input
                type="text"
                value={tenDangNhap}
                onChange={e => setTenDangNhap(e.target.value)}
                className="input-brut"
                placeholder="Nhập tên đăng nhập..."
                autoComplete="username"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                MẬT KHẨU
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={matKhau}
                  onChange={e => setMatKhau(e.target.value)}
                  className="input-brut pr-12"
                  placeholder="Nhập mật khẩu..."
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="font-mono text-xs text-red-500 hover:text-red-400 uppercase tracking-widest">
                  QUÊN MẬT KHẨU?
                </Link>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="btn-brut w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="font-mono text-xs tracking-widest">ĐANG XỬ LÝ...</span>
              ) : (
                <><FiArrowRight size={14} /> ĐĂNG NHẬP</>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="font-mono text-xs text-zinc-600 uppercase tracking-widest">HOẶC</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* REGISTER LINK */}
          <p className="font-mono text-xs text-zinc-500 text-center">
            CHƯA CÓ TÀI KHOẢN?{' '}
            <Link to="/register" className="font-black text-white border-b-2 border-red-600 hover:text-red-500 transition-colors uppercase tracking-wider">
              ĐĂNG KÝ NGAY
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
