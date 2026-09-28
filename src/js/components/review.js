function initReview(root) {
  if (root.dataset.reviewReady === 'true') return;
  root.dataset.reviewReady = 'true';
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const selectTab = (tab) => {
    tabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    panels.forEach((panel) => {
      const active = panel.id === tab.getAttribute('aria-controls');
      panel.hidden = !active;
      if (active) panel.querySelectorAll('[data-horizontal-slider]').forEach((slider) => slider.dispatchEvent(new CustomEvent('horizontal-slider:refresh')));
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); const target = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; selectTab(target); target.focus(); });
  });
  const dialog = root.querySelector('[data-review-dialog]');
  if (!dialog) return;
  const video = dialog.querySelector('video'); const loading = dialog.querySelector('[data-review-loading]'); const empty = dialog.querySelector('[data-review-empty]'); const error = dialog.querySelector('[data-review-error], .review-video-error');
  empty.textContent = 'Видео скоро появится.';
  root.querySelectorAll('[data-review-video]').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('article'); const source = button.dataset.reviewVideo;
    dialog.dialogOpener = button; dialog.querySelector('h2').textContent = card.querySelector('h3')?.textContent || '';
    const role = dialog.querySelector('[data-review-dialog-role], .review__dialog-role'); if (role) role.innerHTML = card.querySelector('p')?.innerHTML || '';
    const dialogCard = dialog.querySelector('[class$="__dialog-card"]'); if (dialogCard) dialogCard.style.setProperty('--review-image', card.style.getPropertyValue('--review-image'));
    loading.hidden = !source; empty.hidden = Boolean(source); error.hidden = true; dialog.showModal(); document.documentElement.classList.add('review-dialog-open');
    if (source && video) { video.src = source; video.load(); video.play().catch(() => {}); }
  }));
  video?.addEventListener('playing', () => { loading.hidden = true; });
  video?.addEventListener('error', () => { if (dialog.open) { loading.hidden = true; error.hidden = false; } });
  video?.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
  dialog.querySelector('[data-review-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.documentElement.classList.remove('review-dialog-open'); video?.pause(); video?.removeAttribute('src'); video?.load(); loading.hidden = true; dialog.dialogOpener?.focus?.(); });
}
document.querySelectorAll('[data-review]').forEach(initReview);
export { initReview };
