import { gsap } from 'gsap';

const { consumePreloaderCookie } = require('./preloader-state.cjs');

const preloader = document.querySelector('[data-preloader]');

if (preloader) {
  const body = document.body;
  const site = document.querySelector('.site-container');
  const logoTarget = preloader.querySelector('[data-preloader-logo]');
  const logo = document.querySelector('.header__logo-link')?.cloneNode(true);
  const fills = [...preloader.querySelectorAll('.preloader__fill')];
  const curtain = preloader.querySelector('.preloader__curtain');
  const shouldRun = consumePreloaderCookie(
    document.cookie,
    (cookie) => { document.cookie = cookie; },
  );
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const removePreloader = () => {
    body.classList.remove('page__body--preloading');
    preloader.remove();
    gsap.set(site, { clearProps: 'opacity,transform,visibility' });
    document.documentElement.dataset.pageReady = 'true';
    document.dispatchEvent(new CustomEvent('platejka:ready'));
  };

  if (!shouldRun || reduceMotion || !site || !logo || fills.length === 0) {
    removePreloader();
  } else {
    logo.removeAttribute('href');
    logo.setAttribute('tabindex', '-1');
    logoTarget.append(logo);
    body.classList.add('page__body--preloading');

    gsap.set(site, { autoAlpha: 0, y: 20 });
    gsap.set(fills, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(curtain, { xPercent: -100 });

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      onComplete: removePreloader,
    });

    timeline.from(logo, {
      autoAlpha: 0,
      scale: 0.84,
      duration: 0.42,
      ease: 'power3.out',
    });

    for (let index = 0; index < fills.length; index += 2) {
      const pair = fills.slice(index, index + 2);

      timeline
        .to(pair, {
          scaleX: () => gsap.utils.random(0.2, 0.82),
          duration: 0.16,
        })
        .to(pair, { scaleX: 1, duration: 0.18 });
    }

    timeline
      .to(curtain, { xPercent: 0, duration: 0.52, ease: 'power2.inOut' }, '+=0.25')
      .to(site, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' })
      .set(preloader, { display: 'none' }, '<');
  }
}
