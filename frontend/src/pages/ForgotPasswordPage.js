import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiArrowRight, FiCheck, FiMail } from 'react-icons/fi';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Vui lòng nhập email'); return; }
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Đã gửi hướng dẫn đặt lại mật khẩu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4 noise">
      {/* BIG BG TEXT */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-brut font-black text-zinc-900 opacity-40 whitespace-nowrap"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '18vw', letterSpacing: '-0.05em' }}>
          RESET
        </span>
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* BACK */}
        <Link to="/login"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-8">
          <FiArrowLeft size={12} /> ĐĂNG NHẬP
        </Link>

        {/* CARD */}
        <div className="border-4 border-white bg-black p-8" style={{ boxShadow: '8px 8px 0 #FF0000' }}>
          {/* LOGO */}
          <Link to="/">
            <span className="font-brut font-black text-xl text-white"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif', letterSpacing: '-0.05em' }}>
              MOVIE<span className="text-red-600">FLIX</span>
            </span>
          </Link>

          {sent ? (
            /* SUCCESS STATE */
            <div className="mt-8 text-center">
              <div className="w-16 h-16 bg-red-600 border-4 border-white flex items-center justify-center mx-auto mb-6"
                style={{ boxShadow: '4px 4px 0 #fff' }}>
                <FiCheck size={28} className="text-white" />
              </div>
              <p className="font-brut font-black text-white text-2xl uppercase mb-2"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                ĐÃ GỬI!
              </p>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">
                KIỂM TRA EMAIL CỦA BẠN
              </p>
              <p className="font-mono text-xs text-zinc-600 mb-8">{email}</p>
              <Link to="/login" className="btn-brut text-xs w-full justify-center">
                <FiArrowLeft size={12} /> ĐĂNG NHẬP
              </Link>
            </div>
          ) : (
            /* FORM */
            <div className="mt-8">
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-2">— QUÊN MẬT KHẨU</p>
              <h2 className="font-brut font-black text-white uppercase leading-none mb-2"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '2rem', letterSpacing: '-0.03em' }}>
                ĐẶT LẠI<br />MẬT KHẨU
              </h2>
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-8">
                NHẬP EMAIL ĐÃ ĐĂNG KÝ ĐỂ NHẬN HƯỚNG DẪN
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    EMAIL
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-brut pl-10"
                      placeholder="email@example.com"
                    />
                    <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brut w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <span className="font-mono text-xs tracking-widest">ĐANG GỬI...</span>
                    : <><FiArrowRight size={14} /> GỬI YÊU CẦU</>
                  }
                </button>
              </form>
            </div>
          )}
        </div>

        {/* BOTTOM LINK */}
        {!sent && (
          <p className="font-mono text-xs text-zinc-600 text-center mt-6 uppercase tracking-widest">
            NHỚ MẬT KHẨU?{' '}
            <Link to="/login" className="text-white border-b border-red-600 hover:text-red-500 transition-colors">
              ĐĂNG NHẬP
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
