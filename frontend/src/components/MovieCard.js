import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiEye } from 'react-icons/fi';

function MovieCard({ movie, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const tenPhim = movie.TenPhim || movie.title || 'KHÔNG CÓ TÊN';
  const hinhAnh = (!imgError && movie.HinhAnh) ? movie.HinhAnh : `https://picsum.photos/seed/${movie._id || 'default'}/300/450`;
  const theLoai = movie.TheLoai?.map(t => t.TenTheLoai || t).filter(Boolean);
  const soTap = movie.SoTap || 0;
  const phanLoai = movie.PhanLoai;

  // Stagger delay based on index
  const delay = Math.min(index * 0.05, 0.5);

  return (
    <Link
      to={`/movie/${movie._id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      <div className="card-brut overflow-hidden">
        {/* POSTER */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={hinhAnh}
            alt={tenPhim}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
            <div className="border-2 border-white p-4 group-hover:border-red-500 transition-colors">
              <FiPlay className="text-white text-2xl" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white">XEM NGAY</span>
          </div>

          {/* BADGE — TYPE */}
          {phanLoai && (
            <div className={`absolute top-0 left-0 px-2 py-1 text-[10px] font-black uppercase tracking-widest ${phanLoai === 'Bộ' ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
              {phanLoai === 'Bộ' ? `${soTap} TẬP` : 'PHIM LẺ'}
            </div>
          )}

          {/* VIEWS */}
          {movie.LuotXem > 0 && (
            <div className="absolute top-0 right-0 bg-black/80 px-2 py-1 flex items-center gap-1">
              <FiEye size={10} className="text-red-500" />
              <span className="text-[10px] font-mono text-white">
                {movie.LuotXem > 1000 ? `${(movie.LuotXem / 1000).toFixed(1)}K` : movie.LuotXem}
              </span>
            </div>
          )}

          {/* BOTTOM STRIPE */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* INFO */}
        <div className="p-3 border-t-2 border-zinc-800 group-hover:border-white transition-colors duration-300">
          <h3
            className="text-xs font-black uppercase tracking-tight text-white truncate group-hover:text-red-500 transition-colors leading-tight"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            {tenPhim}
          </h3>

          <div className="flex items-center justify-between mt-1.5">
            {movie.NamPhatHanh && (
              <span className="text-[10px] font-mono text-zinc-500">{movie.NamPhatHanh}</span>
            )}
            {movie.MaQuocGia?.TenQuocGia && (
              <span className="text-[10px] font-mono text-zinc-500">{movie.MaQuocGia.TenQuocGia}</span>
            )}
          </div>

          {theLoai && theLoai.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {theLoai.slice(0, 2).map((t, i) => (
                <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-700 text-zinc-400 px-1.5 py-0.5">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
