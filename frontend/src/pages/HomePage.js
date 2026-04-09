import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiArrowRight, FiChevronLeft, FiChevronRight, FiEye, FiStar } from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [history, setHistory] = useState([]);
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [genres, setGenres] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featuredRes, moviesRes, genresRes] = await Promise.all([
          API.get('/movies/featured'),
          API.get('/movies?page=1&limit=10'),
          API.get('/genres'),
        ]);
        setFeatured(featuredRes.data);
        setMovies(moviesRes.data.movies);
        setPagination(moviesRes.data.pagination);
        setGenres(genresRes.data);
        if (user) {
          try { const h = await API.get('/movies/history'); setHistory(h.data); } catch {}
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(() => setBannerIndex(p => (p + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured]);

  const fetchMovies = async (page) => {
    try {
      const res = await API.get(`/movies?page=${page}&limit=10`);
      setMovies(res.data.movies);
      setPagination(res.data.pagination);
      document.getElementById('all-movies')?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  const banner = featured[bannerIndex];

  // Ticker content: genre names repeated
  const tickerItems = [...genres, ...genres, ...genres].map(g => g.TenTheLoai).filter(Boolean);

  return (
    <div className="min-h-screen bg-dark-400 noise">

      {/* ═══════════════════════════════════════════
          HERO BANNER — BRUTALIST FULL BLEED
      ═══════════════════════════════════════════ */}
      {banner && (
        <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: '90vh' }}>
          {/* BG IMAGE */}
          <img
            key={banner._id}
            src={banner.HinhAnhBanner || banner.HinhAnh}
            alt={banner.TenPhim}
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            style={{ filter: 'grayscale(30%) contrast(1.1)' }}
          />
          {/* BRUTAL OVERLAY */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(105deg, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.1) 100%)'
          }} />
          {/* RED LEFT BORDER */}
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-red-600" />

          {/* CONTENT */}
          <div className="relative max-w-screen-2xl mx-auto px-8 flex flex-col justify-center" style={{ minHeight: '90vh' }}>
            <div className="max-w-2xl animate-slide-in-left">
              {/* INDEX LABEL */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs text-red-500 tracking-widest uppercase">
                  #{String(bannerIndex + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                </span>
                <div className="h-px flex-1 max-w-[60px] bg-red-600" />
                <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">NỔI BẬT</span>
              </div>

              {/* TITLE */}
              <h1
                className="font-brut font-black uppercase text-white mb-4 leading-none animate-slide-up"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                  letterSpacing: '-0.03em',
                  textShadow: '6px 6px 0 #FF0000',
                }}
              >
                {banner.TenPhim}
              </h1>

              {/* META TAGS */}
              <div className="flex flex-wrap gap-2 mb-6">
                {banner.NamPhatHanh && (
                  <span className="border-2 border-white px-3 py-1 text-xs font-black uppercase tracking-widest">
                    {banner.NamPhatHanh}
                  </span>
                )}
                {banner.DanhGia > 0 && (
                  <span className="bg-yellow-400 text-black border-2 border-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                    <FiStar size={10} /> {banner.DanhGia}
                  </span>
                )}
                {banner.MaQuocGia?.TenQuocGia && (
                  <span className="border-2 border-zinc-600 text-zinc-300 px-3 py-1 text-xs font-black uppercase tracking-widest">
                    {banner.MaQuocGia.TenQuocGia}
                  </span>
                )}
                {banner.LuotXem > 0 && (
                  <span className="border-2 border-zinc-600 text-zinc-300 px-3 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                    <FiEye size={10} /> {(banner.LuotXem / 1000).toFixed(1)}K
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}
              <p className="text-zinc-300 text-sm leading-relaxed mb-8 max-w-lg line-clamp-3 font-mono">
                {banner.MoTa}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link to={`/movie/${banner._id}`} className="btn-brut text-sm">
                  <FiPlay size={14} /> XEM NGAY
                </Link>
                <Link to={`/movie/${banner._id}`}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors group">
                  CHI TIẾT
                  <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* BANNER CONTROLS */}
          <div className="absolute bottom-8 right-8 flex items-center gap-3">
            <button onClick={() => setBannerIndex(p => (p - 1 + featured.length) % featured.length)}
              className="border-2 border-white p-2 hover:bg-white hover:text-black transition-all">
              <FiChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {featured.slice(0, 8).map((_, i) => (
                <button key={i} onClick={() => setBannerIndex(i)}
                  className={`transition-all duration-300 ${i === bannerIndex ? 'w-8 h-2 bg-red-600' : 'w-2 h-2 bg-zinc-600 hover:bg-white'}`} />
              ))}
            </div>
            <button onClick={() => setBannerIndex(p => (p + 1) % featured.length)}
              className="border-2 border-white p-2 hover:bg-white hover:text-black transition-all">
              <FiChevronRight size={16} />
            </button>
          </div>

          {/* BOTTOM LABEL */}
          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end">
            <div className="w-full border-t-2 border-zinc-800" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TICKER MARQUEE
      ═══════════════════════════════════════════ */}
      <div className="bg-red-600 border-y-2 border-white py-3 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-inner-fast">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="font-brut font-black uppercase text-white text-sm tracking-widest px-6 flex-shrink-0"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                {item} <span className="text-black mx-2">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">

        {/* ═══════════════════════════════════════════
            SECTION: TIẾP TỤC XEM
        ═══════════════════════════════════════════ */}
        {user && history.length > 0 && (
          <section className="py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="font-mono text-xs text-red-500 tracking-widest uppercase block mb-1">— DÀNH CHO BẠN</span>
                <h2 className="font-brut font-black uppercase text-white section-title"
                  style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                  TIẾP TỤC XEM
                </h2>
              </div>
              <div className="h-0.5 flex-1 mx-6 bg-zinc-800 hidden md:block" />
              <span className="text-xs font-mono text-zinc-500">{history.length} PHIM</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {history.map((item, i) =>
                item.MaPhim && (
                  <div key={item._id} className="flex-shrink-0 w-36 md:w-44">
                    <MovieCard movie={item.MaPhim} index={i} />
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
            SECTION: NỔI BẬT — HORIZONTAL SCROLL
        ═══════════════════════════════════════════ */}
        {featured.length > 0 && (
          <section className="py-12 border-t-2 border-zinc-800">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="font-mono text-xs text-red-500 tracking-widest uppercase block mb-1">— TOP RATED</span>
                <h2 className="font-brut font-black uppercase text-white section-title"
                  style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                  XEM NHIỀU NHẤT
                </h2>
              </div>
              <div className="h-0.5 flex-1 mx-6 bg-zinc-800 hidden md:block" />
              <Link to="/filter" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                XEM TẤT CẢ <FiArrowRight size={12} />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {featured.map((movie, i) => (
                <div key={movie._id} className="flex-shrink-0 w-36 md:w-44 relative">
                  {/* RANK NUMBER */}
                  <div className="absolute -top-3 -left-1 z-10 font-brut font-black text-3xl text-zinc-800"
                    style={{ fontFamily: '"Arial Black", Impact, sans-serif', WebkitTextStroke: '1px #444', fontSize: '3rem', lineHeight: 1 }}>
                    {i + 1}
                  </div>
                  <div className="relative">
                    <MovieCard movie={movie} index={i} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
            SECTION: TẤT CẢ PHIM — GRID
        ═══════════════════════════════════════════ */}
        <section id="all-movies" className="py-12 border-t-2 border-zinc-800">
          {/* HEADER */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-xs text-red-500 tracking-widest uppercase block mb-1">— THƯ VIỆN</span>
              <h2 className="font-brut font-black uppercase text-white section-title"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                TẤT CẢ PHIM
              </h2>
            </div>
            <div className="h-0.5 flex-1 mx-6 bg-zinc-800 hidden md:block" />
            {pagination && (
              <span className="font-mono text-xs text-zinc-500">{pagination.total} PHIM</span>
            )}
          </div>

          {movies.length === 0 ? (
            <div className="border-2 border-zinc-800 stripe-bg py-20 text-center">
              <p className="font-brut font-black uppercase text-zinc-600 text-2xl"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                KHÔNG CÓ PHIM
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-zinc-800">
                {movies.map((movie, i) => (
                  <div key={movie._id} className="bg-dark-400">
                    <MovieCard movie={movie} index={i} />
                  </div>
                ))}
              </div>
              <Pagination pagination={pagination} onPageChange={fetchMovies} />
            </>
          )}
        </section>

        {/* ═══════════════════════════════════════════
            BOTTOM GENRE GRID
        ═══════════════════════════════════════════ */}
        {genres.length > 0 && (
          <section className="py-12 border-t-2 border-zinc-800">
            <div className="mb-6">
              <span className="font-mono text-xs text-red-500 tracking-widest uppercase block mb-1">— KHÁM PHÁ</span>
              <h2 className="font-brut font-black uppercase text-white section-title"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                THỂ LOẠI
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-zinc-800">
              {genres.map((g, i) => (
                <Link key={g._id} to={`/filter?theloai=${g._id}`}
                  className="bg-dark-400 px-4 py-5 border-2 border-transparent hover:border-white hover:bg-red-600 transition-all group flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest group-hover:text-white">{g.TenTheLoai}</span>
                  <FiArrowRight size={12} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FOOTER STRIP */}
      <div className="border-t-4 border-red-600 bg-black py-8 mt-8">
        <div className="max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-brut font-black text-2xl text-white"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
            MOVIE<span className="text-red-600">FLIX</span>
          </span>
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
            © {new Date().getFullYear()} — XEM PHIM TRỰC TUYẾN — ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
