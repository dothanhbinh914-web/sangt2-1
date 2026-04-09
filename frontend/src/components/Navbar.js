import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiMenu, FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showGenre, setShowGenre] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const genreRef = useRef(null);
  const countryRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    API.get('/genres').then(r => setGenres(r.data)).catch(() => {});
    API.get('/countries').then(r => setCountries(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) setShowGenre(false);
      if (countryRef.current && !countryRef.current.contains(e.target)) setShowCountry(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/filter?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black border-b-4 border-red-600' : 'bg-black border-b-4 border-white'}`}>
      {/* TOP BAR */}
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 group">
            <span
              className="font-brut font-black text-2xl tracking-tighter text-white animate-glitch"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif', letterSpacing: '-0.05em' }}
              data-text="MOVIEFLIX"
            >
              MOVIE<span className="text-red-600">FLIX</span>
            </span>
          </Link>

          {/* SEARCH — DESKTOP */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="TÌM KIẾM PHIM..."
              className="input-brut pr-10 text-xs uppercase tracking-widest"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-red-500 transition-colors">
              <FiSearch size={16} />
            </button>
          </form>

          {/* NAV LINKS — DESKTOP */}
          <div className="hidden md:flex items-center gap-1">
            {/* GENRE */}
            <div className="relative" ref={genreRef}>
              <button
                onClick={() => { setShowGenre(!showGenre); setShowCountry(false); }}
                className="flex items-center gap-1 px-3 py-2 border-2 border-transparent hover:border-white text-xs font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black"
              >
                THỂ LOẠI <FiChevronDown className={`transition-transform ${showGenre ? 'rotate-180' : ''}`} />
              </button>
              {showGenre && (
                <div className="absolute top-full left-0 mt-0 bg-black border-2 border-white shadow-brut-lg-white w-52 max-h-72 overflow-y-auto z-50">
                  {genres.map(g => (
                    <Link
                      key={g._id}
                      to={`/filter?theloai=${g._id}`}
                      className="block px-4 py-2 text-xs uppercase font-bold tracking-wider border-b border-zinc-800 hover:bg-red-600 hover:text-white transition-colors"
                      onClick={() => setShowGenre(false)}
                    >
                      {g.TenTheLoai}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* COUNTRY */}
            <div className="relative" ref={countryRef}>
              <button
                onClick={() => { setShowCountry(!showCountry); setShowGenre(false); }}
                className="flex items-center gap-1 px-3 py-2 border-2 border-transparent hover:border-white text-xs font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black"
              >
                QUỐC GIA <FiChevronDown className={`transition-transform ${showCountry ? 'rotate-180' : ''}`} />
              </button>
              {showCountry && (
                <div className="absolute top-full left-0 mt-0 bg-black border-2 border-white shadow-brut-lg-white w-48 max-h-72 overflow-y-auto z-50">
                  {countries.map(c => (
                    <Link
                      key={c._id}
                      to={`/filter?quocgia=${c._id}`}
                      className="block px-4 py-2 text-xs uppercase font-bold tracking-wider border-b border-zinc-800 hover:bg-red-600 hover:text-white transition-colors"
                      onClick={() => setShowCountry(false)}
                    >
                      {c.TenQuocGia}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* USER — DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUser(!showUser)}
                  className="flex items-center gap-2 border-2 border-white px-3 py-1.5 hover:bg-white hover:text-black transition-all group"
                >
                  <div className="w-6 h-6 bg-red-600 flex items-center justify-center text-white text-xs font-black">
                    {(user.ho_ten?.[0] || user.ten_dang_nhap?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider max-w-[100px] truncate">
                    {user.ho_ten || user.ten_dang_nhap}
                  </span>
                  <FiChevronDown size={12} className={`transition-transform ${showUser ? 'rotate-180' : ''}`} />
                </button>
                {showUser && (
                  <div className="absolute top-full right-0 mt-0 bg-black border-2 border-white shadow-brut-lg-white w-52 z-50">
                    <div className="px-4 py-3 border-b-2 border-zinc-800">
                      <p className="text-xs font-black uppercase text-white">{user.ho_ten || user.ten_dang_nhap}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors border-b border-zinc-800"
                        onClick={() => setShowUser(false)}>
                        <FiSettings size={14} /> ADMIN
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-b border-zinc-800"
                      onClick={() => setShowUser(false)}>
                      <FiUser size={14} /> HỒ SƠ
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-600 hover:text-white transition-colors">
                      <FiLogOut size={14} /> ĐĂNG XUẤT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-white hover:bg-white hover:text-black transition-all">
                  ĐĂNG NHẬP
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-red-600 border-2 border-red-600 hover:bg-transparent hover:text-red-500 transition-all">
                  ĐĂNG KÝ
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden border-2 border-white p-2 hover:bg-white hover:text-black transition-all">
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-t-2 border-white px-4 pb-4 animate-slide-up">
          <form onSubmit={handleSearch} className="relative mt-4">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="TÌM KIẾM PHIM..." className="input-brut pr-10 text-xs uppercase tracking-widest" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2"><FiSearch size={16} /></button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {genres.slice(0, 8).map(g => (
              <Link key={g._id} to={`/filter?theloai=${g._id}`}
                className="text-xs font-black uppercase tracking-wider border border-zinc-700 px-3 py-2 hover:bg-red-600 hover:border-red-600 transition-all"
                onClick={() => setMobileOpen(false)}>
                {g.TenTheLoai}
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-zinc-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase">{user.ho_ten || user.ten_dang_nhap}</span>
                {isAdmin && <Link to="/admin" className="text-xs text-yellow-400 font-black uppercase" onClick={() => setMobileOpen(false)}>ADMIN</Link>}
                <button onClick={handleLogout} className="text-xs text-red-500 font-black uppercase">ĐĂNG XUẤT</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-xs font-black uppercase border border-white px-3 py-2" onClick={() => setMobileOpen(false)}>ĐĂNG NHẬP</Link>
                <Link to="/register" className="text-xs font-black uppercase bg-red-600 px-3 py-2" onClick={() => setMobileOpen(false)}>ĐĂNG KÝ</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
