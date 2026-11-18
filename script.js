/**
 * Lí Lịch Trực Tuyến - Âu Phước Tiến (71K32CNTT03)
 * Pink & White Edition • Be Vietnam Pro • Menu • Swarm Cursors • Spotify Music Controller
 */

// ------------------------------------------------------------------
// Spotify Background Music Controller (Vì Anh Quá Đẹp Trai)
// ------------------------------------------------------------------
(() => {
  const TRACK_URI = 'spotify:track:4zUaQhfFjDQVwe0wBb2K2n';
  let ctrl = null;
  let ready = false;
  let isPlaying = false;
  let hasStarted = false;
  let userPaused = false;
  let pausedByLeave = false;
  let savedPosSec = 0;
  let pendingResumeSeekSec = null;
  let lastPosMs = 0;
  let maxPosMs = 0;
  let durationMs = 0;
  let lastLoopAt = 0;
  let pendingApi = null;

  const ui = () => ({
    navBtn: document.getElementById('musicNavBtn'),
    playBtn: document.getElementById('musicPlayPauseBtn'),
    eq: document.getElementById('musicEq'),
    dock: document.getElementById('spotifyDock'),
    dockToggle: document.getElementById('musicDockToggle'),
    menuMusicBtn: document.getElementById('menuMusicBtn'),
  });

  function syncUI() {
    const { navBtn, playBtn, eq, menuMusicBtn } = ui();
    if (navBtn) {
      navBtn.classList.toggle('playing', isPlaying);
      const span = navBtn.querySelector('span');
      if (span) span.textContent = isPlaying ? 'Đang phát' : 'Nhạc nền';
    }
    if (playBtn) {
      const ic = playBtn.querySelector('i');
      if (ic) ic.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (eq) eq.classList.toggle('playing', isPlaying);
    if (menuMusicBtn) {
      menuMusicBtn.innerHTML = isPlaying
        ? '<i class="fa-solid fa-pause"></i> Tạm dừng Nhạc nền'
        : '<i class="fa-solid fa-music"></i> Phát Nhạc nền';
    }
  }

  function startPlayback() {
    if (!ctrl || !ready) return;
    userPaused = false;
    pausedByLeave = false;
    try {
      if (hasStarted && lastPosMs > 500) {
        ctrl.resume();
      } else {
        ctrl.play();
      }
    } catch (_) {}
  }

  function togglePlayback() {
    if (!ctrl || !ready) return;
    if (isPlaying) {
      userPaused = true;
      pausedByLeave = false;
      ctrl.pause();
    } else {
      startPlayback();
    }
  }

  function mountSpotify(IFrameAPI) {
    const target = document.getElementById('spotify-embed');
    if (!target || ctrl) return;

    IFrameAPI.createController(
      target,
      { uri: TRACK_URI, width: '100%', height: 80 },
      (embedController) => {
        ctrl = embedController;
        window.__spotifyCtrl = ctrl;

        ctrl.addListener('ready', () => {
          ready = true;
          // Attempt immediate autoplay (works when browser permits; otherwise unlocked on first gesture)
          if (!document.hidden && !userPaused) {
            try { ctrl.play(); } catch (_) {}
          }
        });

        ctrl.addListener('playback_update', (e) => {
          const { position = 0, duration = 0, isPaused = true } = e.data || {};
          lastPosMs = position;
          if (duration > 0) durationMs = duration;
          if (position > maxPosMs) maxPosMs = position;

          const wasPlaying = isPlaying;
          isPlaying = !isPaused;
          if (isPlaying && position > 0) hasStarted = true;

          // Safety: if resuming from tab switch unexpectedly reset to ~0, restore exact saved position
          if (isPlaying && pendingResumeSeekSec != null) {
            const targetSec = pendingResumeSeekSec;
            pendingResumeSeekSec = null;
            if (targetSec > 1.5 && position < 1000) {
              try { ctrl.seek(targetSec); } catch (_) {}
            }
          }

          // Loop cleanly back to start when the song reaches its end
          const now = Date.now();
          if (durationMs > 0 && now - lastLoopAt > 1500) {
            const nearEnd = position >= durationMs - 450;
            const endedReset = maxPosMs > durationMs * 0.65 && isPaused && position <= 400 && !userPaused && !pausedByLeave;
            if (nearEnd || endedReset) {
              lastLoopAt = now;
              maxPosMs = 0;
              savedPosSec = 0;
              try {
                ctrl.seek(0);
                ctrl.playFromStart();
              } catch (_) {}
            }
          }

          if (wasPlaying !== isPlaying) syncUI();
        });
      }
    );
  }

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    pendingApi = IFrameAPI;
    if (document.readyState !== 'loading') {
      mountSpotify(IFrameAPI);
    }
  };

  // Unlock music automatically on the very first user gesture anywhere if browser blocked silent autoplay
  let gestureAttempted = false;
  const unlockOnGesture = (e) => {
    if (gestureAttempted || !ctrl || !ready || isPlaying || userPaused || document.hidden) return;
    if (e && e.target && e.target.closest && e.target.closest('#musicNavBtn, #musicPlayPauseBtn, #menuMusicBtn, #spotifyDock')) return;
    gestureAttempted = true;
    startPlayback();
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, unlockOnGesture, { capture: true, passive: true });
  });

  // Pause automatically when leaving to another tab/website, resume from exact spot upon returning
  document.addEventListener('visibilitychange', () => {
    if (!ctrl || !ready) return;
    if (document.hidden) {
      if (isPlaying && !userPaused) {
        pausedByLeave = true;
        savedPosSec = lastPosMs / 1000;
        try { ctrl.pause(); } catch (_) {}
      }
    } else {
      if (pausedByLeave && !userPaused) {
        pausedByLeave = false;
        pendingResumeSeekSec = savedPosSec;
        try { ctrl.resume(); } catch (_) {}
      }
    }
  });

  window.addEventListener('pagehide', () => {
    if (ctrl && ready && isPlaying) {
      pausedByLeave = true;
      savedPosSec = lastPosMs / 1000;
      try { ctrl.pause(); } catch (_) {}
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (pendingApi && !ctrl) mountSpotify(pendingApi);

    const { navBtn, playBtn, dock, dockToggle, menuMusicBtn } = ui();
    if (navBtn) navBtn.addEventListener('click', togglePlayback);
    if (playBtn) playBtn.addEventListener('click', togglePlayback);
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
// Page Interactions: Top Reset, Menu Dropdown, Swarm, Filter, Lightbox
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  // Ensure clean Pink & White mode
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('apt_theme');
  } catch (_) {}

  // 1. Quick Menu Dropdown ("Menu" button in Navbar)
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

  // 2. Swarm Cursors Trigger Buttons (https://github.com/DhvanilPatel/swarm-cursors)
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

  // 3. Course Filter Buttons
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

  // 4. Frosted Pink Image Lightbox for School Photos & Avatar
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

  // 5. Active Nav Link Highlight on Scroll
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
