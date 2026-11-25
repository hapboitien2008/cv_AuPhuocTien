/**
 * Lí Lịch Trực Tuyến - Âu Phước Tiến (71K32CNTT03)
 * Taste-Skill 2.5 Edition • Pink & White Glassmorphism • Be Vietnam Pro
 * Interactive Code Tabs • Swarm Cursors • YouTube Autoplay Music Controller
 */

// ------------------------------------------------------------------
// 1. YouTube Background Music Controller (Vì Anh Quá Đẹp Trai)
// ------------------------------------------------------------------
(() => {
  const YT_PRIMARY_ID = 'cnMX-Z3UkZ4';
  const YT_FALLBACK_IDS = ['1u_HAAnBJiA', '5T54dha6I7A'];
  let fallbackIdx = -1;
  let currentVideoId = YT_PRIMARY_ID;
  let player = null;
  let ready = false;
  let isPlaying = false;
  let isMuted = false;
  let autoMutedForPolicy = false;
  let userPaused = false;
  let pausedByLeave = false;
  let savedPosSec = 0;
  let pendingResumeSeekSec = null;
  let apiReadyFired = false;

  const ui = () => ({
    navBtn: document.getElementById('musicNavBtn'),
    playBtn: document.getElementById('musicPlayPauseBtn'),
    muteBtn: document.getElementById('musicMuteBtn'),
    unmuteHint: document.getElementById('musicUnmuteHint'),
    trackTitle: document.getElementById('musicTrackTitle'),
    eq: document.getElementById('musicEq'),
    dock: document.getElementById('musicDock'),
    dockToggle: document.getElementById('musicDockToggle'),
    menuMusicBtn: document.getElementById('menuMusicBtn'),
  });

  function syncUI() {
    const { navBtn, playBtn, muteBtn, unmuteHint, eq, menuMusicBtn } = ui();
    const soundActive = isPlaying && !isMuted && !autoMutedForPolicy;

    if (navBtn) {
      navBtn.classList.toggle('playing', isPlaying);
      const span = navBtn.querySelector('span');
      if (span) {
        span.textContent = autoMutedForPolicy
          ? 'Bật tiếng'
          : isPlaying
          ? 'Đang phát'
          : 'Nhạc nền';
      }
    }
    if (playBtn) {
      const ic = playBtn.querySelector('i');
      if (ic) ic.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (muteBtn) {
      const mic = muteBtn.querySelector('i');
      if (mic) mic.className = isMuted || autoMutedForPolicy ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
      muteBtn.classList.toggle('is-alert', autoMutedForPolicy);
      muteBtn.title = isMuted || autoMutedForPolicy ? 'Bật âm thanh' : 'Tắt âm thanh';
    }
    if (unmuteHint) {
      unmuteHint.hidden = !(autoMutedForPolicy && !userPaused);
    }
    if (eq) eq.classList.toggle('playing', isPlaying);
    if (menuMusicBtn) {
      menuMusicBtn.innerHTML = soundActive
        ? '<i class="fa-solid fa-pause"></i> Tạm dừng Nhạc nền'
        : '<i class="fa-solid fa-music"></i> Phát Nhạc nền';
    }
  }

  function unmuteAndPlay() {
    if (!player || !ready) return;
    autoMutedForPolicy = false;
    userPaused = false;
    pausedByLeave = false;
    isMuted = false;
    try {
      player.unMute();
      player.setVolume(82);
      if (typeof player.getPlayerState === 'function' && player.getPlayerState() !== 1) {
        player.playVideo();
      }
    } catch (_) {}
    syncUI();
  }

  function togglePlayback() {
    if (!player || !ready) return;
    if (autoMutedForPolicy || isMuted) {
      unmuteAndPlay();
      return;
    }
    if (isPlaying) {
      userPaused = true;
      pausedByLeave = false;
      try {
        savedPosSec = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0;
        player.pauseVideo();
      } catch (_) {}
    } else {
      userPaused = false;
      pausedByLeave = false;
      try {
        player.unMute();
        player.setVolume(82);
        player.playVideo();
      } catch (_) {}
    }
    syncUI();
  }

  function toggleMute() {
    if (!player || !ready) return;
    if (isMuted || autoMutedForPolicy) {
      unmuteAndPlay();
    } else {
      isMuted = true;
      try {
        player.mute();
      } catch (_) {}
      syncUI();
    }
  }

  function initYouTubePlayer() {
    const target = document.getElementById('youtube-player');
    if (!target || player || typeof window.YT === 'undefined' || !window.YT.Player) return;

    const playerVars = {
      autoplay: 1,
      mute: 1,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
      controls: 1,
      enablejsapi: 1,
    };
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      playerVars.origin = window.location.origin;
    }

    player = new window.YT.Player('youtube-player', {
      width: '100%',
      height: '100%',
      videoId: currentVideoId,
      playerVars,
      events: {
        onReady: (event) => {
          ready = true;
          window.__ytMusicPlayer = event.target;

          if (!document.hidden && !userPaused) {
            try {
              event.target.playVideo();
              event.target.unMute();
              event.target.setVolume(82);
            } catch (_) {}

            setTimeout(() => {
              if (!ready || !player || userPaused || document.hidden) return;
              let st = -1;
              let curMuted = true;
              try {
                st = player.getPlayerState();
                curMuted = player.isMuted();
              } catch (_) {}

              if (st !== 1 && st !== 3) {
                autoMutedForPolicy = true;
                isMuted = true;
                try {
                  player.mute();
                  player.playVideo();
                } catch (_) {}
                syncUI();
              } else {
                isPlaying = true;
                isMuted = curMuted;
                autoMutedForPolicy = curMuted;
                syncUI();
              }
            }, 650);
          }
        },
        onError: (event) => {
          // Error 101 / 150: original copyright owner disabled third-party embedding -> switch to embeddable cover seamlessly
          if (fallbackIdx + 1 < YT_FALLBACK_IDS.length) {
            fallbackIdx += 1;
            currentVideoId = YT_FALLBACK_IDS[fallbackIdx];
            const { trackTitle } = ui();
            if (trackTitle) {
              trackTitle.textContent = fallbackIdx === 0 ? 'Vì Anh Quá Đẹp Trai (Acoustic)' : 'Vì Anh Quá Đẹp Trai (Inst.)';
            }
            try {
              event.target.loadVideoById(currentVideoId);
              if (!document.hidden && !userPaused) {
                event.target.playVideo();
              }
            } catch (_) {}
          }
        },
        onStateChange: (event) => {
          const YTState = window.YT && window.YT.PlayerState ? window.YT.PlayerState : { ENDED: 0, PLAYING: 1, PAUSED: 2 };
          if (event.data === YTState.PLAYING) {
            isPlaying = true;
            isMuted = typeof event.target.isMuted === 'function' ? event.target.isMuted() : false;
            if (!isMuted) autoMutedForPolicy = false;

            if (pendingResumeSeekSec != null) {
              const targetSec = pendingResumeSeekSec;
              pendingResumeSeekSec = null;
              try {
                const cur = event.target.getCurrentTime();
                if (targetSec > 1 && Math.abs(cur - targetSec) > 1.8) {
                  event.target.seekTo(targetSec, true);
                }
              } catch (_) {}
            }
          } else if (event.data === YTState.PAUSED) {
            isPlaying = false;
          } else if (event.data === YTState.ENDED) {
            // Loop cleanly from the beginning when song ends
            savedPosSec = 0;
            pendingResumeSeekSec = null;
            if (!userPaused && !document.hidden) {
              try {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } catch (_) {}
            }
          }
          syncUI();
        },
      },
    });
  }

  window.onYouTubeIframeAPIReady = () => {
    apiReadyFired = true;
    if (document.readyState !== 'loading') {
      initYouTubePlayer();
    }
  };

  // Unlock sound smoothly on the first user gesture anywhere if browser muted autoplay
  const unlockAudioOnFirstGesture = () => {
    if (!ready || !player || userPaused || document.hidden) return;
    if (autoMutedForPolicy || !isPlaying) {
      unmuteAndPlay();
    }
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, unlockAudioOnFirstGesture, { capture: true, passive: true });
  });

  // Pause cleanly when switching to another tab/window; resume from exact saved timestamp when back
  document.addEventListener('visibilitychange', () => {
    if (!player || !ready) return;
    if (document.hidden) {
      if (isPlaying && !userPaused) {
        pausedByLeave = true;
        try {
          savedPosSec = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0;
          player.pauseVideo();
        } catch (_) {}
      }
    } else {
      if (pausedByLeave && !userPaused) {
        pausedByLeave = false;
        pendingResumeSeekSec = savedPosSec;
        try {
          if (savedPosSec > 0.5) player.seekTo(savedPosSec, true);
          player.playVideo();
        } catch (_) {}
      }
    }
  });

  window.addEventListener('pagehide', () => {
    if (player && ready && isPlaying) {
      pausedByLeave = true;
      try {
        savedPosSec = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0;
        player.pauseVideo();
      } catch (_) {}
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if ((apiReadyFired || (window.YT && window.YT.Player)) && !player) initYouTubePlayer();

    const { navBtn, playBtn, muteBtn, unmuteHint, dock, dockToggle, menuMusicBtn } = ui();
    if (navBtn) navBtn.addEventListener('click', togglePlayback);
    if (playBtn) playBtn.addEventListener('click', togglePlayback);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
    if (unmuteHint) unmuteHint.addEventListener('click', unmuteAndPlay);
    if (menuMusicBtn) menuMusicBtn.addEventListener('click', togglePlayback);

    if (dock && dockToggle) {
      dockToggle.addEventListener('click', () => {
        const collapsed = dock.classList.toggle('collapsed');
        const ic = dockToggle.querySelector('i');
        if (ic) ic.className = collapsed ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      });
    }
    syncUI();
  });
})();

// ------------------------------------------------------------------
// 2. Page Interactions: Bento Tabs, Menu Dropdown, Swarm, Filter, Lightbox
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  // Clean Pink & White mode
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('apt_theme');
  } catch (_) {}

  // Quick Menu Dropdown ("Menu" button in Navbar)
  const menuBtn = document.getElementById('menuToggleBtn');
  const menuDropdown = document.getElementById('quickMenuDropdown');

  const closeMenu = () => {
    if (!menuBtn || !menuDropdown) return;
    menuDropdown.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menuDropdown.hidden;
      menuDropdown.hidden = !willOpen;
      menuBtn.setAttribute('aria-expanded', String(willOpen));
    });

    menuDropdown.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (!menuDropdown.hidden && !menuDropdown.contains(e.target) && e.target !== menuBtn) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // Interactive Bento Live Code Tabs (taste-skill live UI fragment)
  const codeTabBtns = document.querySelectorAll('.code-tab-btn');
  const codeViews = document.querySelectorAll('.code-view');
  const codeHintText = document.getElementById('codeHintText');

  codeTabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const targetId = tabBtn.getAttribute('data-code-target');
      const hintMsg = tabBtn.getAttribute('data-code-hint');

      codeTabBtns.forEach((b) => b.classList.remove('is-on'));
      tabBtn.classList.add('is-on');

      codeViews.forEach((v) => {
        v.classList.toggle('is-on', v.id === targetId);
      });

      if (codeHintText && hintMsg) {
        codeHintText.textContent = hintMsg;
      }
    });
  });

  // Swarm Cursors Trigger Buttons
  const triggerSwarm = () => {
    if (window.__swarmRebuild) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.__swarmRebuild.app) {
        window.__swarmRebuild.restart();
      } else {
        window.__swarmRebuild.start();
      }
    }
  };

  const swarmNavBtn = document.getElementById('swarmTriggerBtn');
  const swarmHeroBtn = document.getElementById('heroSwarmBtn');
  const menuSwarmBtn = document.getElementById('menuSwarmBtn');

  if (swarmNavBtn) swarmNavBtn.addEventListener('click', triggerSwarm);
  if (swarmHeroBtn) swarmHeroBtn.addEventListener('click', triggerSwarm);
  if (menuSwarmBtn) menuSwarmBtn.addEventListener('click', triggerSwarm);

  // Course Filter Controls
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      courseCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Frosted Pink Image Lightbox
  window.openLightbox = function (src, caption) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    if (!lightbox || !lightboxImg) return;
    lightbox.style.display = 'flex';
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
  };

  window.closeLightbox = function () {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) lightbox.style.display = 'none';
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeLightbox();
    }
  });

  // Active Nav Link Highlight on Scroll
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-menu a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 130;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
});
