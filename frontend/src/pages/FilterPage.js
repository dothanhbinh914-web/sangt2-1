import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import API from '../api/axios';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

function FilterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get('q') || '';
  const theloai = searchParams.get('theloai') || '';
  const quocgia = searchParams.get('quocgia') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    Promise.all([API.get('/genres'), API.get('/countries')])
      .then(([gRes, cRes]) => { setGenres(gRes.data); setCountries(cRes.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let url;
        if (q) {
          url = `/movies/search?q=${encodeURIComponent(q)}&page=${page}&limit=12`;
        } else if (theloai || quocgia) {
          const params = new URLSearchParams();
          if (theloai) params.set('theloai', theloai);
          if (quocgia) params.set('quocgia', quocgia);
          params.set('page', page); params.set('limit', 12);
          url = `/movies/filter?${params.toString()}`;
        } else {
          url = `/movies?page=${page}&limit=12`;
        }
        const res = await API.get(url);
        setMovies(res.data.movies);
        setPagination(res.data.pagination);
      } catch { setMovies([]); }
      finally { setLoading(false); }
    };
    fetchMovies();
  }, [q, theloai, quocgia, page]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setFilter = (key, value) => {
    const params = new URLSearchParams();
    if (value) params.set(key, value);
    params.set('page', 1);
    setSearchParams(params);
  };

  const clearAll = () => setSearchParams({ page: 1 });

  const currentGenreName = genres.find(g => g._id === theloai)?.TenTheLoai;
  const currentCountryName = countries.find(c => c._id === quocgia)?.TenQuocGia;
  const hasFilter = q || theloai || quocgia;

  const getTitle = () => {
    if (q) return `"${q.toUpperCase()}"`;
    if (currentGenreName) return currentGenreName.toUpperCase();
    if (currentCountryName) return currentCountryName.toUpperCase();
    return 'TẤT CẢ PHIM';
  };

  return (
    <div className="min-h-screen bg-dark-400">

      {/* ── PAGE HEADER ── */}
      <div className="border-b-4 border-white bg-black">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-1">
                {q ? '— KẾT QUẢ TÌM KIẾM' : theloai ? '— THỂ LOẠI' : quocgia ? '— QUỐC GIA' : '— THƯ VIỆN'}
              </p>
              <h1 className="font-brut font-black text-white uppercase leading-none"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}>
                {getTitle()}
              </h1>
              {pagination && (
                <p className="font-mono text-xs text-zinc-500 mt-2 uppercase tracking-widest">
                  {pagination.total} KẾT QUẢ
                </p>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center gap-2 border-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-white text-black border-white' : 'border-white text-white hover:bg-white hover:text-black'}`}
            >
              <FiSliders size={14} /> BỘ LỌC
            </button>
          </div>

          {/* ACTIVE FILTERS */}
          {hasFilter && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">ĐANG LỌC:</span>
              {q && (
                <span className="flex items-center gap-2 bg-red-600 border-2 border-red-600 text-white px-3 py-1 text-xs font-black uppercase">
                  TÌM: {q}
                  <button onClick={clearAll}><FiX size={12} /></button>
                </span>
              )}
              {currentGenreName && (
                <span className="flex items-center gap-2 bg-white text-black px-3 py-1 text-xs font-black uppercase">
                  {currentGenreName}
                  <button onClick={clearAll}><FiX size={12} /></button>
                </span>
              )}
              {currentCountryName && (
                <span className="flex items-center gap-2 bg-white text-black px-3 py-1 text-xs font-black uppercase">
                  {currentCountryName}
                  <button onClick={clearAll}><FiX size={12} /></button>
                </span>
              )}
              <button onClick={clearAll} className="font-mono text-xs text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors ml-2">
                XÓA TẤT CẢ
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div className="border-b-2 border-zinc-800 py-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* SEARCH */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">TÌM KIẾM</label>
                <form onSubmit={e => { e.preventDefault(); const v = e.target.elements.search.value.trim(); if (v) setSearchParams({ q: v, page: 1 }); }}
                  className="relative">
                  <input name="search" type="text" defaultValue={q} placeholder="Tên phim..."
                    className="input-brut pr-10 text-xs" />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors">
                    <FiSearch size={14} />
                  </button>
                </form>
              </div>

              {/* GENRE */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">THỂ LOẠI</label>
                <select value={theloai} onChange={e => setFilter('theloai', e.target.value)}
                  className="input-brut text-xs uppercase cursor-pointer">
                  <option value="">TẤT CẢ</option>
                  {genres.map(g => (
                    <option key={g._id} value={g._id}>{g.TenTheLoai?.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* COUNTRY */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">QUỐC GIA</label>
                <select value={quocgia} onChange={e => setFilter('quocgia', e.target.value)}
                  className="input-brut text-xs uppercase cursor-pointer">
                  <option value="">TẤT CẢ</option>
                  {countries.map(c => (
                    <option key={c._id} value={c._id}>{c.TenQuocGia?.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── GENRE TABS (khi chưa lọc) ── */}
        {!hasFilter && genres.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide border-b border-zinc-800">
            <button
              onClick={clearAll}
              className={`flex-shrink-0 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all ${!theloai && !quocgia ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-white hover:text-white'}`}
            >
              TẤT CẢ
            </button>
            {genres.map(g => (
              <button key={g._id} onClick={() => setFilter('theloai', g._id)}
                className={`flex-shrink-0 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all ${theloai === g._id ? 'bg-red-600 text-white border-red-600' : 'border-zinc-700 text-zinc-400 hover:border-white hover:text-white'}`}>
                {g.TenTheLoai}
              </button>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        <div className="py-8">
          {loading ? (
            <LoadingSpinner />
          ) : movies.length === 0 ? (
            <div className="border-4 border-zinc-800 stripe-bg py-24 text-center">
              <FiSearch className="text-6xl text-zinc-700 mx-auto mb-4" />
              <p className="font-brut font-black text-zinc-600 text-3xl uppercase mb-2"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                KHÔNG TÌM THẤY
              </p>
              <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">THỬ TỪ KHÓA KHÁC</p>
              <button onClick={clearAll}
                className="mt-6 btn-brut text-xs mx-auto">
                XEM TẤT CẢ PHIM
              </button>
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
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterPage;
