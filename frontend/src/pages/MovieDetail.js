import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPlay, FiArrowLeft, FiStar, FiEye, FiClock, FiCalendar, FiGlobe } from 'react-icons/fi';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await API.get(`/movies/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!movie) return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center">
      <div className="border-4 border-white p-12 text-center" style={{ boxShadow: '8px 8px 0 #FF0000' }}>
        <p className="font-brut font-black text-white text-4xl uppercase mb-4"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>404</p>
        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-6">KHÔNG TÌM THẤY PHIM</p>
        <Link to="/" className="btn-brut text-xs">VỀ TRANG CHỦ</Link>
      </div>
    </div>
  );

  const firstEp = movie.episodes?.[0];
  const watchUrl = firstEp ? `/watch/${movie._id}?tap=${firstEp._id}` : `/watch/${movie._id}`;

  const metaItems = [
    movie.DanhGia > 0 && { icon: <FiStar size={12} />, value: movie.DanhGia, color: 'bg-yellow-400 text-black border-yellow-400' },
    movie.LuotXem > 0 && { icon: <FiEye size={12} />, value: `${(movie.LuotXem / 1000).toFixed(1)}K`, color: 'border-zinc-600 text-zinc-300' },
    movie.ThoiLuong > 0 && { icon: <FiClock size={12} />, value: `${movie.ThoiLuong} PHÚT`, color: 'border-zinc-600 text-zinc-300' },
    movie.NamPhatHanh && { icon: <FiCalendar size={12} />, value: movie.NamPhatHanh, color: 'border-zinc-600 text-zinc-300' },
    movie.MaQuocGia?.TenQuocGia && { icon: <FiGlobe size={12} />, value: movie.MaQuocGia.TenQuocGia.toUpperCase(), color: 'border-zinc-600 text-zinc-300' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-dark-400 noise">

      {/* ── HERO BANNER ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '65vh', minHeight: 400 }}>
        <img
          src={movie.HinhAnhBanner || movie.HinhAnh || `https://picsum.photos/seed/${id}/1200/600`}
          alt={movie.TenPhim}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(20%) contrast(1.1)' }}
        />
        {/* OVERLAY LAYERS */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.97) 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.1) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, transparent 50%)' }} />
        {/* RED LEFT BAR */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-600" />

        {/* BACK BUTTON */}
        <div className="absolute top-6 left-6 z-10">
          <Link to="/" className="flex items-center gap-2 border-2 border-white/50 hover:border-white px-3 py-2 text-xs font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black backdrop-blur-sm">
            <FiArrowLeft size={12} /> QUAY LẠI
          </Link>
        </div>

        {/* HERO TEXT */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8">
          {movie.PhanLoai && (
            <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-widest mb-3 ${movie.PhanLoai === 'Bộ' ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
              {movie.PhanLoai === 'Bộ' ? `PHIM BỘ — ${movie.SoTap || 0} TẬP` : 'PHIM LẺ'}
            </span>
          )}
          <h1
            className="font-brut font-black text-white uppercase leading-none animate-slide-up"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: 'clamp(2rem, 5vw, 4.5rem)', letterSpacing: '-0.03em', textShadow: '5px 5px 0 #FF0000' }}
          >
            {movie.TenPhim}
          </h1>
          {movie.TieuDe && (
            <p className="font-mono text-sm text-zinc-400 mt-1 uppercase tracking-widest">{movie.TieuDe}</p>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">

        {/* META + POSTER ROW */}
        <div className="flex flex-col md:flex-row gap-8 py-8 border-b-2 border-zinc-800">

          {/* POSTER */}
          <div className="flex-shrink-0 w-36 md:w-52 mx-auto md:mx-0 -mt-20 relative z-10">
            <div className="border-4 border-white" style={{ boxShadow: '8px 8px 0 #FF0000' }}>
              <img
                src={movie.HinhAnh || `https://picsum.photos/seed/${id}/300/450`}
                alt={movie.TenPhim}
                className="w-full block"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1 min-w-0">
            {/* META BADGES */}
            <div className="flex flex-wrap gap-2 mb-5">
              {metaItems.map((item, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest ${item.color}`}>
                  {item.icon} {item.value}
                </span>
              ))}
            </div>

            {/* GENRES */}
            {movie.TheLoai?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.TheLoai.map((t, i) => (
                  <Link key={t._id || i} to={`/filter?theloai=${t._id}`}
                    className="border-2 border-red-600 text-red-500 px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                    {t.TenTheLoai}
                  </Link>
                ))}
              </div>
            )}

            {/* DESCRIPTION */}
            {(movie.MoTa || movie.NoiDung) && (
              <p className="font-mono text-sm text-zinc-300 leading-relaxed mb-6 max-w-2xl">
                {movie.MoTa || movie.NoiDung}
              </p>
            )}

            {/* CAST / DIRECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-lg">
              {movie.DienVien?.length > 0 && (
                <div className="border-l-2 border-red-600 pl-3">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">DIỄN VIÊN</p>
                  <p className="text-xs font-black text-white uppercase">{movie.DienVien.map(d => d.TenDienVien).join(', ')}</p>
                </div>
              )}
              {movie.DaoDien?.length > 0 && (
                <div className="border-l-2 border-zinc-600 pl-3">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">ĐẠO DIỄN</p>
                  <p className="text-xs font-black text-white uppercase">{movie.DaoDien.map(d => d.TenDaoDien).join(', ')}</p>
                </div>
              )}
            </div>

            {/* CTA BUTTON */}
            {movie.episodes?.length > 0 && (
              <Link to={watchUrl} className="btn-brut text-sm">
                <FiPlay size={14} /> XEM NGAY
              </Link>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        {movie.episodes?.length > 0 && (
          <section className="py-8">
            {/* TAB HEADERS */}
            <div className="flex border-b-2 border-zinc-800 mb-6">
              {[
                { id: 'info', label: `TẬP PHIM (${movie.episodes.length})` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-4 -mb-0.5 ${activeTab === tab.id ? 'border-red-600 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* EPISODE GRID */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {movie.episodes.map((ep, i) => (
                <Link
                  key={ep._id}
                  to={`/watch/${movie._id}?tap=${ep._id}`}
                  className="group relative border-2 border-zinc-800 hover:border-white bg-zinc-900 hover:bg-red-600 transition-all duration-200 flex flex-col items-center justify-center py-4 px-2"
                  style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s` }}
                >
                  <FiPlay size={14} className="text-zinc-500 group-hover:text-white mb-1.5 transition-colors" />
                  <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white transition-colors text-center leading-tight">
                    {ep.TenTap}
                  </span>
                  {/* HOVER CORNER */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-l-[12px] border-l-red-600 border-b-[12px] border-b-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM SPACING ── */}
        <div className="pb-16" />
      </div>
    </div>
  );
}

export default MovieDetail;
