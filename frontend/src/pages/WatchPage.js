import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiPlay, FiSkipForward, FiAlertTriangle,
  FiCheck, FiSettings, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiPause
} from 'react-icons/fi';
import Hls from 'hls.js';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const PROGRESS_SAVE_INTERVAL = 15;

// Lấy quality preference từ localStorage
function getSavedQuality() {
  try { return parseInt(localStorage.getItem('preferredQuality') || '-1'); }
  catch { return -1; }
}
function saveQualityPref(level) {
  try { localStorage.setItem('preferredQuality', String(level)); } catch {}
}

function WatchPage() {
  const { id: movieId } = useParams();
  const [searchParams] = useSearchParams();
  const tapId = searchParams.get('tap');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data state
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);

  // Player state
  const [playerData, setPlayerData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Quality state
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto
  const [autoQualityLabel, setAutoQualityLabel] = useState('');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualitySwitching, setQualitySwitching] = useState(false);

  // Custom controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);

  // Auto-next state
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(5);

  // Refs
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const playerContainerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const nextTimerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const resumeTimeRef = useRef(0);
  const hasResumedRef = useRef(false);
  const episodeListRef = useRef(null);
  const qualityMenuRef = useRef(null);

  // =============================================
  // 1. Fetch movie + episodes + resume progress
  // =============================================
  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        const [movieRes, episodesRes] = await Promise.all([
          API.get(`/movies/${movieId}`),
          API.get(`/episodes/${movieId}`)
        ]);
        setMovie(movieRes.data);
        setEpisodes(episodesRes.data);

        let targetEp = null;
        let resumeTime = 0;

        if (tapId) {
          targetEp = episodesRes.data.find(e => e._id === tapId) || episodesRes.data[0];
        }

        if (user && !tapId) {
          try {
            const progressRes = await API.get(`/episodes/progress/${movieId}`);
            if (progressRes.data.MaTap) {
              targetEp = episodesRes.data.find(e => e._id === progressRes.data.MaTap);
              resumeTime = progressRes.data.ThoiGianXem || 0;
            }
          } catch {}
        }

        if (!targetEp && episodesRes.data.length > 0) {
          targetEp = episodesRes.data[0];
        }

        resumeTimeRef.current = resumeTime;
        hasResumedRef.current = false;
        setCurrentEpisode(targetEp);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();

    return () => {
      destroyHls();
      clearInterval(progressTimerRef.current);
      clearInterval(nextTimerRef.current);
    };
  }, [movieId]); // eslint-disable-line

  // =============================================
  // 2. Khi tapId thay đổi
  // =============================================
  useEffect(() => {
    if (!tapId || episodes.length === 0) return;
    const ep = episodes.find(e => e._id === tapId);
    if (ep && ep._id !== currentEpisode?._id) {
      resumeTimeRef.current = 0;
      hasResumedRef.current = false;
      setCurrentEpisode(ep);
      setShowNextOverlay(false);
      clearInterval(nextTimerRef.current);
    }
  }, [tapId]); // eslint-disable-line

  // =============================================
  // 3. Khi currentEpisode thay đổi → gọi /play/:id
  // =============================================
  useEffect(() => {
    if (!currentEpisode) return;

    const fetchPlayUrl = async () => {
      setVideoLoading(true);
      setVideoError(null);
      setPlayerData(null);
      setQualityLevels([]);
      setCurrentQuality(-1);
      setAutoQualityLabel('');
      destroyHls();

      try {
        const res = await API.get(`/episodes/play/${currentEpisode._id}`);
        setPlayerData(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Không thể tải video';
        setVideoError(msg);
        setVideoLoading(false);
      }
    };
    fetchPlayUrl();

    if (user) {
      API.post(`/movies/${movieId}/history`, { MaTap: currentEpisode._id }).catch(() => {});
    }

    setTimeout(() => {
      const activeEl = document.querySelector('[data-episode-active="true"]');
      if (activeEl && episodeListRef.current) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 100);
  }, [currentEpisode?._id]); // eslint-disable-line

  // =============================================
  // 4. Khi playerData có → attach HLS hoặc MP4
  //    + Quality selection logic
  // =============================================
  useEffect(() => {
    if (!playerData || !videoRef.current) return;

    const video = videoRef.current;
    const { url, type } = playerData;

    if (type === 'HLS') {
      // Safari native HLS (không có quality control)
      if (video.canPlayType('application/vnd.apple.mpegurl') && !Hls.isSupported()) {
        video.src = url;
        video.addEventListener('loadedmetadata', handleVideoLoaded);
      }
      // hls.js cho Chrome/Firefox/Edge - CÓ quality control
      else if (Hls.isSupported()) {
        const savedLevel = getSavedQuality();
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          startLevel: savedLevel, // -1 = auto, hoặc level index đã lưu
          capLevelOnFPSDrop: true,
          capLevelToPlayerSize: false,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        // ---- MANIFEST_PARSED: lấy danh sách quality ----
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels;
          if (levels && levels.length > 0) {
            const qualityList = levels.map((level, index) => ({
              index,
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}kbps`,
            }));
            // Sort theo height giảm dần (1080p ở trên)
            qualityList.sort((a, b) => (b.height || b.bitrate) - (a.height || a.bitrate));
            setQualityLevels(qualityList);

            // Áp dụng quality đã lưu
            if (savedLevel >= 0 && savedLevel < levels.length) {
              hls.currentLevel = savedLevel;
              setCurrentQuality(savedLevel);
            } else {
              setCurrentQuality(-1);
            }
          }
          handleVideoLoaded();
        });

        // ---- LEVEL_SWITCHING: loading indicator khi chuyển quality ----
        hls.on(Hls.Events.LEVEL_SWITCHING, (_event, data) => {
          setQualitySwitching(true);
          const level = hls.levels[data.level];
          if (level) {
            setAutoQualityLabel(level.height ? `${level.height}p` : '');
          }
        });

        // ---- LEVEL_SWITCHED: đã chuyển xong ----
        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setQualitySwitching(false);
          const level = hls.levels[data.level];
          if (level) {
            setAutoQualityLabel(level.height ? `${level.height}p` : '');
          }
        });

        // ---- FRAG_BUFFERED: cập nhật auto quality label ----
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (hls.currentLevel === -1 && hls.levels[hls.loadLevel]) {
            const level = hls.levels[hls.loadLevel];
            setAutoQualityLabel(level.height ? `${level.height}p` : '');
          }
        });

        // ---- ERROR handling ----
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS network error, retrying...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS media error, recovering...');
                hls.recoverMediaError();
                break;
              default:
                setVideoError('Không thể phát video HLS. Vui lòng thử lại.');
                setVideoLoading(false);
                hls.destroy();
                break;
            }
          }
        });
      } else {
        setVideoError('Trình duyệt không hỗ trợ phát HLS');
        setVideoLoading(false);
      }
    } else {
      // MP4 - không có quality selection
      video.src = url;
      video.addEventListener('loadedmetadata', handleVideoLoaded);
      video.addEventListener('error', handleVideoError);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoaded);
      video.removeEventListener('error', handleVideoError);
    };
  }, [playerData]); // eslint-disable-line

  // =============================================
  // Close quality menu on outside click
  // =============================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(e.target)) {
        setShowQualityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =============================================
  // Hide controls after 3s idle
  // =============================================
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !showQualityMenu) {
        setShowControls(false);
      }
    }, 3000);
  }, [showQualityMenu]);

  // =============================================
  // Fullscreen change listener
  // =============================================
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // =============================================
  // Helpers
  // =============================================
  function destroyHls() {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }

  function handleVideoLoaded() {
    setVideoLoading(false);
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration || 0);

    if (!hasResumedRef.current && resumeTimeRef.current > 5) {
      const seekTo = resumeTimeRef.current;
      if (video.duration && seekTo < video.duration * 0.95) {
        video.currentTime = seekTo;
        toast.info(`Tiếp tục từ ${formatTime(seekTo)}`, { autoClose: 2000 });
      }
      hasResumedRef.current = true;
    }

    video.play().then(() => setIsPlaying(true)).catch(() => {});
  }

  function handleVideoError() {
    setVideoError('Không thể tải video. File có thể bị lỗi hoặc không tồn tại.');
    setVideoLoading(false);
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function formatBitrate(bps) {
    if (!bps) return '';
    if (bps >= 1000000) return `${(bps / 1000000).toFixed(1)} Mbps`;
    return `${Math.round(bps / 1000)} kbps`;
  }

  // =============================================
  // Quality selection handler
  // =============================================
  const handleQualityChange = (levelIndex) => {
    const hls = hlsRef.current;
    if (!hls) return;

    hls.currentLevel = levelIndex;
    setCurrentQuality(levelIndex);
    saveQualityPref(levelIndex);
    setShowQualityMenu(false);

    if (levelIndex === -1) {
      hls.nextLevel = -1; // let ABR decide
    }
  };

  const getCurrentQualityLabel = () => {
    if (currentQuality === -1) {
      return autoQualityLabel ? `Auto (${autoQualityLabel})` : 'Auto';
    }
    const level = qualityLevels.find(q => q.index === currentQuality);
    return level ? level.label : 'Auto';
  };

  // =============================================
  // Custom video controls handlers
  // =============================================
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    video.muted = val === 0;
    setIsMuted(val === 0);
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch(() => {});
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setIsPlaying(!video.paused);

    // Update buffered
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  };

  // =============================================
  // Auto-save tiến trình mỗi 15 giây
  // =============================================
  const saveProgress = useCallback(() => {
    if (!user || !videoRef.current || !currentEpisode) return;
    const video = videoRef.current;
    if (video.paused || video.ended || !video.currentTime) return;

    API.post('/episodes/progress', {
      MaPhim: movieId,
      MaTap: currentEpisode._id,
      ThoiGianXem: Math.floor(video.currentTime)
    }).catch(() => {});
  }, [user, movieId, currentEpisode]);

  useEffect(() => {
    clearInterval(progressTimerRef.current);
    if (user && currentEpisode) {
      progressTimerRef.current = setInterval(saveProgress, PROGRESS_SAVE_INTERVAL * 1000);
    }
    return () => clearInterval(progressTimerRef.current);
  }, [user, currentEpisode, saveProgress]);

  // =============================================
  // Auto-next episode
  // =============================================
  const getNextEpisode = useCallback(() => {
    if (!currentEpisode || episodes.length === 0) return null;
    const idx = episodes.findIndex(e => e._id === currentEpisode._id);
    if (idx < 0 || idx >= episodes.length - 1) return null;
    return episodes[idx + 1];
  }, [currentEpisode, episodes]);

  const goToNextEpisode = useCallback(() => {
    const next = getNextEpisode();
    if (!next) return;
    setShowNextOverlay(false);
    clearInterval(nextTimerRef.current);
    navigate(`/watch/${movieId}?tap=${next._id}`, { replace: true });
  }, [getNextEpisode, movieId, navigate]);

  const handleVideoEnded = useCallback(() => {
    saveProgress();
    setIsPlaying(false);

    const next = getNextEpisode();
    if (!next) {
      toast.info('Đã xem hết tất cả các tập!');
      return;
    }

    setShowNextOverlay(true);
    setNextCountdown(5);
    let count = 5;
    clearInterval(nextTimerRef.current);
    nextTimerRef.current = setInterval(() => {
      count--;
      setNextCountdown(count);
      if (count <= 0) {
        clearInterval(nextTimerRef.current);
        goToNextEpisode();
      }
    }, 1000);
  }, [saveProgress, getNextEpisode, goToNextEpisode]);

  const cancelAutoNext = () => {
    setShowNextOverlay(false);
    clearInterval(nextTimerRef.current);
  };

  const handleEpisodeClick = (ep) => {
    if (ep._id === currentEpisode?._id) return;
    saveProgress();
    setShowNextOverlay(false);
    clearInterval(nextTimerRef.current);
    navigate(`/watch/${movieId}?tap=${ep._id}`, { replace: true });
  };

  const handleRetry = () => {
    if (!currentEpisode) return;
    setVideoError(null);
    setVideoLoading(true);
    setPlayerData(null);
    setQualityLevels([]);
    destroyHls();
    API.get(`/episodes/play/${currentEpisode._id}`)
      .then(res => setPlayerData(res.data))
      .catch(() => {
        setVideoError('Vẫn không thể tải video');
        setVideoLoading(false);
      });
  };

  // =============================================
  // RENDER
  // =============================================
  if (pageLoading) return <LoadingSpinner />;
  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Không tìm thấy phim</p>
    </div>
  );

  const nextEp = getNextEpisode();
  const currentIndex = currentEpisode
    ? episodes.findIndex(e => e._id === currentEpisode._id)
    : -1;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const isHLS = playerData?.type === 'HLS';

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to={`/movie/${movieId}`}
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition">
            <FiArrowLeft />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
          <h1 className="text-base md:text-xl font-bold text-white truncate ml-4 flex-1 text-right">
            {movie.TenPhim}
            {currentEpisode && <span className="text-primary"> - {currentEpisode.TenTap}</span>}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

          {/* ===== VIDEO PLAYER WITH CUSTOM CONTROLS ===== */}
          <div className="flex-1 min-w-0">
            <div
              ref={playerContainerRef}
              className="relative bg-black rounded-xl overflow-hidden aspect-video group select-none"
              onMouseMove={resetControlsTimer}
              onMouseLeave={() => {
                if (!videoRef.current?.paused && !showQualityMenu) setShowControls(false);
              }}
              onMouseEnter={() => setShowControls(true)}
            >
              {/* Video element */}
              <video
                ref={videoRef}
                playsInline
                className={`w-full h-full ${videoLoading || videoError ? 'hidden' : 'block'}`}
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              />

              {/* Quality switching indicator */}
              {qualitySwitching && !videoLoading && (
                <div className="absolute top-4 right-4 bg-black/70 px-3 py-1.5 rounded-lg flex items-center space-x-2 z-20">
                  <div className="w-3 h-3 border-2 border-gray-500 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-300">Đang chuyển chất lượng...</span>
                </div>
              )}

              {/* Current quality badge (top-left, always visible briefly) */}
              {isHLS && qualityLevels.length > 0 && !videoLoading && !videoError && (
                <div className={`absolute top-4 left-4 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="bg-black/60 text-xs text-white px-2.5 py-1 rounded-md">
                    {getCurrentQualityLabel()}
                  </span>
                </div>
              )}

              {/* ===== CUSTOM CONTROLS OVERLAY ===== */}
              {!videoLoading && !videoError && currentEpisode && (
                <div className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {/* Gradient background */}
                  <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3 px-4">

                    {/* Progress bar */}
                    <div
                      className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress mb-3 hover:h-1.5 transition-all"
                      onClick={handleSeek}
                    >
                      {/* Buffered */}
                      <div
                        className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                        style={{ width: `${bufferedPercent}%` }}
                      />
                      {/* Progress */}
                      <div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                      {/* Thumb */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `calc(${progressPercent}% - 7px)` }}
                      />
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between">

                      {/* Left controls */}
                      <div className="flex items-center space-x-3">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="text-white hover:text-primary transition p-1">
                          {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} />}
                        </button>

                        {/* Next episode */}
                        {nextEp && (
                          <button
                            onClick={() => handleEpisodeClick(nextEp)}
                            className="text-white hover:text-primary transition p-1"
                            title="Tập tiếp theo"
                          >
                            <FiSkipForward size={20} />
                          </button>
                        )}

                        {/* Volume */}
                        <div className="flex items-center space-x-1 group/vol">
                          <button onClick={toggleMute} className="text-white hover:text-primary transition p-1">
                            {isMuted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                          </button>
                          <input
                            type="range" min="0" max="1" step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-primary cursor-pointer opacity-0 group-hover/vol:opacity-100"
                          />
                        </div>

                        {/* Time */}
                        <span className="text-white/80 text-xs font-mono hidden sm:block">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center space-x-2">

                        {/* ===== QUALITY SELECTOR (chỉ hiện với HLS) ===== */}
                        {isHLS && qualityLevels.length > 0 && (
                          <div className="relative" ref={qualityMenuRef}>
                            <button
                              onClick={() => setShowQualityMenu(!showQualityMenu)}
                              className={`flex items-center space-x-1.5 text-white hover:text-primary transition px-2 py-1 rounded ${showQualityMenu ? 'bg-white/10' : ''}`}
                              title="Chất lượng video"
                            >
                              <FiSettings size={18} className={`${qualitySwitching ? 'animate-spin' : ''}`} />
                              <span className="text-xs font-medium hidden sm:block">
                                {getCurrentQualityLabel()}
                              </span>
                            </button>

                            {/* Quality dropdown menu */}
                            {showQualityMenu && (
                              <div className="absolute bottom-full right-0 mb-2 bg-dark-100/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/10 py-2 min-w-[200px] z-50">
                                <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Chất lượng</span>
                                </div>

                                {/* Auto option */}
                                <button
                                  onClick={() => handleQualityChange(-1)}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition ${
                                    currentQuality === -1
                                      ? 'text-primary bg-primary/10'
                                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">Auto</span>
                                    {autoQualityLabel && currentQuality === -1 && (
                                      <span className="text-xs text-gray-500">({autoQualityLabel})</span>
                                    )}
                                  </div>
                                  {currentQuality === -1 && <FiCheck size={16} />}
                                </button>

                                {/* Divider */}
                                <div className="h-px bg-white/5 my-1" />

                                {/* Quality levels */}
                                {qualityLevels.map((level) => (
                                  <button
                                    key={level.index}
                                    onClick={() => handleQualityChange(level.index)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition ${
                                      currentQuality === level.index
                                        ? 'text-primary bg-primary/10'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{level.label}</span>
                                      {level.height >= 1080 && (
                                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">HD</span>
                                      )}
                                      {level.height >= 2160 && (
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">4K</span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] text-gray-500">{formatBitrate(level.bitrate)}</span>
                                      {currentQuality === level.index && <FiCheck size={16} />}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Source type badge */}
                        {playerData && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium hidden md:block ${
                            isHLS ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {isHLS ? 'HLS' : 'MP4'}
                          </span>
                        )}

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white hover:text-primary transition p-1">
                          {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Big play button overlay (khi pause) */}
              {!isPlaying && !videoLoading && !videoError && currentEpisode && !showNextOverlay && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  onClick={togglePlay}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center transition shadow-2xl">
                    <FiPlay className="text-white text-2xl md:text-3xl ml-1" />
                  </div>
                </div>
              )}

              {/* Loading overlay */}
              {videoLoading && !videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-100 z-30">
                  <div className="w-14 h-14 border-4 border-dark-400 border-t-primary rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-400 text-sm">Đang tải video...</p>
                  {playerData && (
                    <p className="mt-1 text-gray-500 text-xs">
                      Nguồn: {playerData.type === 'HLS' ? 'HLS Stream' : 'MP4'}
                    </p>
                  )}
                </div>
              )}

              {/* Error overlay */}
              {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-100 z-30">
                  <FiAlertTriangle className="text-5xl text-red-500 mb-4" />
                  <p className="text-gray-300 text-center mb-1">{videoError}</p>
                  <p className="text-gray-500 text-sm mb-4">{currentEpisode?.TenTap}</p>
                  <button onClick={handleRetry}
                    className="px-6 py-2 bg-primary hover:bg-red-700 text-white rounded-lg transition">
                    Thử lại
                  </button>
                </div>
              )}

              {/* No episode */}
              {!currentEpisode && !videoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-100 z-30">
                  <FiPlay className="text-6xl text-gray-600 mb-4" />
                  <p className="text-gray-400">Chọn một tập để bắt đầu xem</p>
                </div>
              )}

              {/* Auto-next overlay */}
              {showNextOverlay && nextEp && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
                  <div className="text-center p-6">
                    <p className="text-gray-300 text-sm mb-2">Tập tiếp theo</p>
                    <p className="text-white text-xl font-bold mb-4">{nextEp.TenTap}</p>
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#333" strokeWidth="4" />
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#e50914" strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - nextCountdown / 5)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-linear" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                        {nextCountdown}
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={cancelAutoNext}
                        className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                        Hủy
                      </button>
                      <button onClick={goToNextEpisode}
                        className="px-4 py-2 text-sm bg-primary hover:bg-red-700 text-white rounded-lg transition flex items-center space-x-2">
                        <FiSkipForward />
                        <span>Phát ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Episode nav + info below player */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => { if (currentIndex > 0) handleEpisodeClick(episodes[currentIndex - 1]); }}
                disabled={currentIndex <= 0}
                className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
                ← Tập trước
              </button>
              <span className="text-sm text-gray-500">{currentIndex + 1} / {episodes.length}</span>
              <button
                onClick={() => { if (nextEp) handleEpisodeClick(nextEp); }}
                disabled={!nextEp}
                className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center space-x-1">
                <span>Tập sau</span>
                <FiSkipForward size={14} />
              </button>
            </div>

            {/* Movie info */}
            <div className="mt-4 bg-dark-100 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white">{movie.TenPhim}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {movie.NamPhatHanh && (
                  <span className="text-xs text-gray-400 bg-dark-400 px-2 py-1 rounded">{movie.NamPhatHanh}</span>
                )}
                {movie.MaQuocGia?.TenQuocGia && (
                  <span className="text-xs text-gray-400 bg-dark-400 px-2 py-1 rounded">{movie.MaQuocGia.TenQuocGia}</span>
                )}
                {movie.TheLoai?.map(t => (
                  <span key={t._id} className="text-xs text-gray-400 bg-dark-400 px-2 py-1 rounded">{t.TenTheLoai}</span>
                ))}
                {isHLS && qualityLevels.length > 0 && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    {qualityLevels.length} chất lượng khả dụng
                  </span>
                )}
              </div>
              {movie.MoTa && <p className="text-gray-400 text-sm mt-3">{movie.MoTa}</p>}
            </div>
          </div>

          {/* ===== EPISODE SIDEBAR ===== */}
          {episodes.length > 0 && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-dark-100 rounded-xl p-4 lg:sticky lg:top-4">
                <h3 className="text-white font-bold mb-3">Danh sách tập ({episodes.length})</h3>
                <div ref={episodeListRef}
                  className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                  {episodes.map((ep, index) => {
                    const isActive = currentEpisode?._id === ep._id;
                    return (
                      <button
                        key={ep._id}
                        data-episode-active={isActive ? 'true' : 'false'}
                        onClick={() => handleEpisodeClick(ep)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition text-left ${
                          isActive
                            ? 'bg-primary text-white ring-2 ring-primary/50'
                            : 'bg-dark-400 text-gray-300 hover:bg-dark-300'
                        }`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isActive ? 'bg-white/20' : 'bg-dark-200'
                        }`}>
                          {isActive ? <FiPlay size={12} /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ep.TenTap}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            {ep.duration && <span className="text-xs opacity-60">{ep.duration} phút</span>}
                            {ep.status === 'ready' && (
                              <span className="flex items-center space-x-1 text-xs text-green-400 opacity-70">
                                <FiCheck size={10} /><span>Sẵn sàng</span>
                              </span>
                            )}
                            {ep.status === 'error' && <span className="text-xs text-red-400 opacity-70">Lỗi</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
