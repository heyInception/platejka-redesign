import gsap from 'gsap';

const section = document.querySelector('.review');

if (section) {
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const panels = [...section.querySelectorAll('[role="tabpanel"]')];
  const track = section.querySelector('.review__track');
  const cards = [...track.children];
  const previous = section.querySelector('.review__arrow--prev');
  const next = section.querySelector('.review__arrow--next');
  const dialog = section.querySelector('.review__dialog');
  const video = dialog.querySelector('video');
  const empty = dialog.querySelector('.review__video-empty');
  const loading = dialog.querySelector('.review__loading');
  const error = dialog.querySelector('.review__video-error');
  let current = 0;

  const selectTab = (tab) => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const target = tabs[(index + offset + tabs.length) % tabs.length];
      selectTab(target);
      target.focus();
    });
  });

  const updateSlider = () => {
    const maximum = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    const distance = Math.min(cards[current].offsetLeft - cards[0].offsetLeft, maximum);
    gsap.to(track, { x: -distance, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.45, ease: 'power2.out', overwrite: true });
    previous.disabled = distance <= 0;
    next.disabled = distance >= maximum;
  };

  previous.addEventListener('click', () => { current = Math.max(0, current - 1); updateSlider(); });
  next.addEventListener('click', () => { current = Math.min(cards.length - 1, current + 1); updateSlider(); });
  window.addEventListener('resize', updateSlider);
  updateSlider();

  section.querySelectorAll('[data-review-video]').forEach((button) => {
    button.addEventListener('click', () => {
      const source = button.dataset.reviewVideo;
      const card = button.closest('.review__card');
      dialog.querySelector('.review__dialog-card').style.setProperty('--review-image', card.style.getPropertyValue('--review-image'));
      dialog.querySelector('h2').textContent = card.querySelector('h3').textContent;
      dialog.querySelector('.review__dialog-role').innerHTML = card.querySelector('p').innerHTML;
      loading.hidden = !source;
      error.hidden = true;
      empty.hidden = Boolean(source);
      dialog.showModal();
      document.documentElement.classList.add('review-dialog-open');
      if (source) {
        video.src = source;
        video.load();
        video.play().catch(() => {});
      }
    });
  });

  video.addEventListener('playing', () => { loading.hidden = true; });
  video.addEventListener('waiting', () => { loading.hidden = false; });
  video.addEventListener('pause', () => { loading.hidden = true; });
  video.addEventListener('error', () => {
    if (!dialog.open) return;
    loading.hidden = true;
    error.hidden = false;
  });

  video.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });

  dialog.querySelector('.review__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('review-dialog-open');
    video.pause();
    video.removeAttribute('src');
    video.load();
    loading.hidden = true;
  });
}
