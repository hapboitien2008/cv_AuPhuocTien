/**
 * Lí Lịch Trực Tuyến - Âu Phước Tiến (71K32CNTT03)
 * Pink & White Edition • Be Vietnam Pro • Swarm Cursors Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  // Ensure clean Pink & White mode (remove any legacy theme attributes)
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('apt_theme');
  } catch (_) {}

  // 1. Swarm Cursors Trigger Buttons (https://github.com/DhvanilPatel/swarm-cursors)
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

  if (swarmNavBtn) swarmNavBtn.addEventListener('click', triggerSwarm);
  if (swarmHeroBtn) swarmHeroBtn.addEventListener('click', triggerSwarm);

  // 2. Course Filter Buttons
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

  // 3. Frosted Pink Image Lightbox for School Photos
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

  // 4. Active Nav Link Highlight on Scroll
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
