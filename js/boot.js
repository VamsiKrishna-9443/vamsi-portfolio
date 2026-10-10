/* Small, bounded enhancement: without JavaScript the complete portfolio is visible. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('vk-intro-seen') === '1'; } catch (_) {}
  if (!reduce && !seen && !location.hash) {
    root.classList.add('intro-pending');
    // Independent fail-safe, including a missing or failed main script.
    window.vkIntroFailSafe = setTimeout(() => {
      root.classList.remove('intro-pending');
      const cinema = document.getElementById('cinema');
      if (cinema) cinema.hidden = true;
      const video = document.getElementById('intro-video');
      if (video) video.pause();
    }, 6500);
  }
})();
