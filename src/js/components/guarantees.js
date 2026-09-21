import { gsap } from 'gsap';

const { getClosestSlideIndex } = require('./shipments-slider.cjs');

document.querySelectorAll('[data-guarantees-slider]').forEach((slider) => {
  const cards = [...slider.children];
  if (!cards.length) return;

  let pointerId = null;
  let startX = 0;
  let startScrollLeft = 0;

  const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;
  const getStep = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 288;

  const snap = (direction = 0) => {
    if (!isMobile()) return;
    const step = getStep();
    const current = getClosestSlideIndex(slider.scrollLeft, step, cards.length);
    const index = Math.min(cards.length - 1, Math.max(0, current + direction));

    gsap.to(slider, {
      scrollLeft: index * step,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  slider.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !isMobile()) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = slider.scrollLeft;
    slider.setPointerCapture(pointerId);
    gsap.killTweensOf(slider);
  });

  slider.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    slider.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const release = (event) => {
    if (event.pointerId !== pointerId) return;
    if (slider.hasPointerCapture(pointerId)) slider.releasePointerCapture(pointerId);
    pointerId = null;
    snap();
  };

  slider.addEventListener('pointerup', release);
  slider.addEventListener('pointercancel', release);
  slider.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    snap(event.key === 'ArrowRight' ? 1 : -1);
  });
});
