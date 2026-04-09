import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(2, page - delta);
    const end = Math.min(totalPages - 1, page + delta);
    pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-10 pt-8 border-t-2 border-zinc-800">
      {/* PREV */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="border-2 border-zinc-700 p-2.5 text-zinc-400 hover:border-white hover:text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft size={14} />
      </button>

      {getPages().map((p, i) => {
        if (p === '...') {
          return (
            <span key={`dot-${i}`} className="font-mono text-xs text-zinc-600 px-2">···</span>
          );
        }
        const isActive = p === page;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 text-xs font-black uppercase border-2 transition-all ${
              isActive
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-white hover:text-white hover:bg-white hover:text-black'
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* NEXT */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="border-2 border-zinc-700 p-2.5 text-zinc-400 hover:border-white hover:text-white hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight size={14} />
      </button>

      {/* PAGE INFO */}
      <span className="font-mono text-xs text-zinc-600 uppercase tracking-widest ml-4">
        {page} / {totalPages}
      </span>
    </div>
  );
}

export default Pagination;
