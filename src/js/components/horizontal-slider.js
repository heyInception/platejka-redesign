import { gsap } from 'gsap';

const {
  clampIndex,
  getTargetOffset,
  getReachableIndex,
  shouldShowControls,
  isIndexedControlActive,
  isInteractiveTarget,
} = require('./horizontal-slider.cjs');

function initHorizontalSlider(root) {
  if (!root || root.dataset.horizontalSliderReady === 'true') return null;

  const viewport = root.querySelector('[data-horizontal-slider-viewport]');
  const track = root.querySelector('[data-horizontal-slider-track]');
  const slides = [...root.querySelectorAll('[data-horizontal-slider-slide]')];
  const previous = root.querySelector('[data-horizontal-slider-prev]');
  const next = root.querySelector('[data-horizontal-slider-next]');
  const controls = root.querySelector('[data-horizontal-slider-controls]');
  const indexedControls = [...root.querySelectorAll('[data-horizontal-slider-go-to]')];
  if (!viewport || !track || !slides.length) return null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1025px)');
  const minimumControls = Number.parseInt(root.dataset.horizontalSliderMinControls || '0', 10);
  const desktopControlsOnly = root.hasAttribute('data-horizontal-slider-desktop-controls');
  let currentIndex = 0;
  let currentOffset = 0;
  let offsets = [];
  let pointerStart = null;
  let dragStart = 0;

  const syncControls = () => {
    const maximum = Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (controls) controls.hidden = !shouldShowControls(
      slides.length,
      minimumControls,
      desktop.matches,
      desktopControlsOnly,
    );
    if (previous) previous.disabled = currentOffset <= 0;
    if (next) next.disabled = currentOffset >= maximum;
    indexedControls.forEach((control) => {
      const active = isIndexedControlActive(control.dataset.horizontalSliderGoTo, currentIndex, slides.length);
      control.setAttribute('aria-current', active ? 'true' : 'false');
      control.classList.toggle('is-active', active);
    });
  };

  const measure = () => {
    offsets = slides.map((slide) => slide.offsetLeft);
  };

  const goTo = (index, immediate = false) => {
    measure();
    currentIndex = getReachableIndex(offsets, clampIndex(index, slides.length), viewport.clientWidth, track.scrollWidth);
    currentOffset = getTargetOffset(offsets, currentIndex, viewport.clientWidth, track.scrollWidth);
    const x = -currentOffset;
    gsap.to(track, {
      x,
      duration: immediate || reducedMotion.matches ? 0 : 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    syncControls();
    root.dispatchEvent(new CustomEvent('horizontal-slider:change', { detail: { index: currentIndex } }));
    return currentIndex;
  };

  const refresh = () => goTo(currentIndex, true);
  const nearestIndex = (position) => offsets.reduce((best, offset, index) => (
    Math.abs(offset - position) < Math.abs(offsets[best] - position) ? index : best
  ), 0);

  previous?.addEventListener('click', () => goTo(currentIndex - 1));
  next?.addEventListener('click', () => goTo(currentIndex + 1));
  indexedControls.forEach((control) => {
    control.addEventListener('click', () => goTo(Number(control.dataset.horizontalSliderGoTo)));
  });
  viewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  viewport.addEventListener('pointerdown', (event) => {
    if (isInteractiveTarget(event.target)) return;
    pointerStart = event.clientX;
    dragStart = gsap.getProperty(track, 'x') || 0;
    viewport.setPointerCapture?.(event.pointerId);
  });
  viewport.addEventListener('pointermove', (event) => {
    if (pointerStart === null) return;
    gsap.set(track, { x: dragStart + event.clientX - pointerStart });
  });
  const release = () => {
    if (pointerStart === null) return;
    const position = Math.max(0, -(gsap.getProperty(track, 'x') || 0));
    pointerStart = null;
    goTo(nearestIndex(position));
  };
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  window.addEventListener('resize', refresh, { passive: true });
  root.addEventListener('horizontal-slider:refresh', refresh);

  root.dataset.horizontalSliderReady = 'true';
  refresh();
  return { goTo, refresh };
}

document.querySelectorAll('[data-horizontal-slider]').forEach(initHorizontalSlider);

export { initHorizontalSlider };
