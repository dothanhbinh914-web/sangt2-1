import React from 'react';

function LoadingSpinner({ text = 'LOADING' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* BRUTALIST SPINNER */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-zinc-800" />
        <div className="absolute inset-0 border-4 border-transparent border-t-red-600 animate-spin" />
        <div className="absolute inset-2 border-2 border-transparent border-b-white animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-600" />
        </div>
      </div>

      {/* TEXT */}
      <div className="flex items-center gap-1">
        <span
          className="font-brut font-black text-white uppercase tracking-widest text-sm"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
        >
          {text}
        </span>
        <span className="flex gap-0.5 ml-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1 h-1 bg-red-600 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
