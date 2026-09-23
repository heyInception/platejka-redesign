function initCallMotion(root, gsap, reducedMotion = false) {
  if (!root || !gsap) return null;

  const title = root.querySelector('[data-call-title]');
  const cards = [...root.querySelectorAll('[data-call-card]')];
  const form = root.querySelector('[data-call-form]');
  const targets = [title, ...cards, form].filter(Boolean);

  if (reducedMotion) {
    gsap.set(targets, { clearProps: 'all' });
    return null;
  }

  const timeline = gsap.timeline({
    defaults: { duration: 0.72, ease: 'power3.out' },
    scrollTrigger: {
      trigger: root,
      start: 'top 72%',
      once: true,
    },
  });

  timeline
    .from(title, { autoAlpha: 0, y: 32 }, 0)
    .from(cards, { autoAlpha: 0, y: 24, stagger: 0.09 }, 0.18)
    .from(form, { autoAlpha: 0, x: 36 }, 0.28);

  return timeline;
}

function initCallForm(root) {
  const form = root?.querySelector?.('form');
  if (!form || form.dataset?.callFormReady === 'true') return false;

  form.addEventListener('submit', (event) => event.preventDefault());
  if (form.dataset) form.dataset.callFormReady = 'true';
  return true;
}

module.exports = { initCallForm, initCallMotion };
