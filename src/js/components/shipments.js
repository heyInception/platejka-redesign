import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const { getClosestSlideIndex } = require('./shipments-slider.cjs');

gsap.registerPlugin(ScrollTrigger);

function initShipmentsMotion(root) {
  const images = [...root.querySelectorAll('[data-shipments-image]')];
  if (!images.length) return;

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(images, { clearProps: 'all' });
  });
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const animation = gsap.from(images, {
      autoAlpha: 0,
      xPercent: 18,
      yPercent: 16,
      scale: 0.88,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: root,
        start: 'top 72%',
        once: true,
      },
    });

    return () => animation.kill();
  });
}

function initShipmentsSlider(root) {
  const slider = root.querySelector('[data-shipments-slider]');
  const cards = slider ? [...slider.children] : [];
  if (!slider || !cards.length) return;

  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startScrollLeft = 0;

  const getStep = () => cards[1]
    ? cards[1].offsetLeft - cards[0].offsetLeft
    : cards[0].getBoundingClientRect().width + 8;

  const snap = (direction = 0) => {
    if (!window.matchMedia('(max-width: 1024px)').matches) return;
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
    if (event.button !== 0 || !window.matchMedia('(max-width: 1024px)').matches) return;
    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = slider.scrollLeft;
    slider.setPointerCapture(pointerId);
    gsap.killTweensOf(slider);
  });

  slider.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    slider.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const release = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
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
}

function initShipments(root) {
  if (root.dataset.shipmentsReady === 'true') return;
  root.dataset.shipmentsReady = 'true';
  initShipmentsMotion(root);
  initShipmentsSlider(root);
}

document.querySelectorAll('[data-shipments]').forEach(initShipments);

export { initShipments, initShipmentsMotion, initShipmentsSlider };
