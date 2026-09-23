'use strict';

function getParts(item) {
  return {
    trigger: item.querySelector('[data-faq-trigger]'),
    panel: item.querySelector('[data-faq-panel]'),
    icon: item.querySelector('.faq__icon'),
  };
}

function renderItem(item, expanded, gsap, reducedMotion, animate) {
  const { trigger, panel, icon } = getParts(item);
  if (!trigger || !panel) return;

  trigger.setAttribute('aria-expanded', String(expanded));
  item.classList.toggle('is-open', expanded);
  gsap.killTweensOf([panel, icon].filter(Boolean));

  if (expanded) panel.hidden = false;

  if (!animate || reducedMotion) {
    gsap.set(panel, {
      height: expanded ? 'auto' : 0,
      autoAlpha: expanded ? 1 : 0,
      overflow: expanded ? 'visible' : 'hidden',
    });
    if (icon) gsap.set(icon, { rotation: expanded ? 180 : 0 });
    panel.hidden = !expanded;
    return;
  }

  if (expanded) {
    gsap.fromTo(panel, {
      height: 0,
      autoAlpha: 0,
      overflow: 'hidden',
    }, {
      height: 'auto',
      autoAlpha: 1,
      duration: 0.46,
      ease: 'power3.inOut',
      clearProps: 'height,overflow,opacity,visibility',
    });
  } else {
    gsap.to(panel, {
      height: 0,
      autoAlpha: 0,
      overflow: 'hidden',
      duration: 0.34,
      ease: 'power2.inOut',
      onComplete: () => {
        panel.hidden = true;
        gsap.set(panel, { clearProps: 'height,overflow,opacity,visibility' });
      },
    });
  }

  if (icon) {
    gsap.to(icon, {
      rotation: expanded ? 180 : 0,
      duration: 0.38,
      ease: 'power3.inOut',
      overwrite: 'auto',
    });
  }
}

function initFaq(root, gsap, reducedMotion = false) {
  if (!root || !gsap) return false;

  const items = [...root.querySelectorAll('[data-faq-item]')];
  if (!items.length) return false;

  items.forEach((item) => {
    const { trigger } = getParts(item);
    if (!trigger) return;

    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    renderItem(item, expanded, gsap, reducedMotion, false);

    trigger.addEventListener('click', () => {
      const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

      items.forEach((candidate) => {
        const candidateTrigger = getParts(candidate).trigger;
        const candidateOpen = candidateTrigger?.getAttribute('aria-expanded') === 'true';
        if (candidate === item) {
          renderItem(candidate, shouldOpen, gsap, reducedMotion, true);
        } else if (candidateOpen) {
          renderItem(candidate, false, gsap, reducedMotion, true);
        }
      });
    });
  });

  return true;
}

function initFaqSections(doc, gsap, reducedMotion = false) {
  return [...doc.querySelectorAll('[data-faq]')]
    .filter((root) => initFaq(root, gsap, reducedMotion))
    .length;
}

module.exports = { initFaq, initFaqSections };
