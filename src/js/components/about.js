import { gsap } from 'gsap';

function initAboutDialog(root) {
  const dialog = root.querySelector('[data-about-dialog]');
  const openButton = root.querySelector('[data-about-dialog-open]');
  const closeButton = dialog?.querySelector('[data-about-dialog-close]');

  if (!dialog || !openButton) return;

  openButton.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.dialogOpener = openButton;
    dialog.showModal();
  });

  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.dialogOpener?.focus?.();
    dialog.dialogOpener = null;
  });
}

function initAboutMotion(root) {
  const media = root.querySelector('[data-about-media]');
  const intro = root.querySelector('[data-about-intro]');
  const cards = root.querySelectorAll('.about-card');
  const cta = root.querySelector('[data-about-cta]');
  const animatedElements = [media, intro, ...cards, cta].filter(Boolean);
  const mediaQueries = gsap.matchMedia();

  mediaQueries.add(
    { reduceMotion: '(prefers-reduced-motion: reduce)' },
    (context) => {
      if (context.conditions.reduceMotion) {
        gsap.set(animatedElements, { clearProps: 'all' });
        return undefined;
      }

      gsap.set(media, { autoAlpha: 0, x: -48 });
      gsap.set(intro, { autoAlpha: 0, x: 48 });
      gsap.set(cards, { autoAlpha: 0, y: 32 });
      gsap.set(cta, { autoAlpha: 0, y: 24 });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          const timeline = gsap.timeline({
            defaults: { duration: 0.7, ease: 'power2.out', clearProps: 'transform,opacity,visibility' },
          });

          timeline
            .to(media, { autoAlpha: 1, x: 0 }, 0)
            .to(intro, { autoAlpha: 1, x: 0 }, 0.08)
            .to(cards, { autoAlpha: 1, y: 0, stagger: 0.12 }, 0.24)
            .to(cta, { autoAlpha: 1, y: 0 }, 0.42);

          observer.disconnect();
        },
        { threshold: 0.15 },
      );

      observer.observe(root);
      return () => observer.disconnect();
    },
  );
}

function initAbout(root) {
  if (root.dataset.aboutReady === 'true') return;
  root.dataset.aboutReady = 'true';
  initAboutDialog(root);
  initAboutMotion(root);
}

document.querySelectorAll('[data-about]').forEach(initAbout);

export { initAbout, initAboutDialog, initAboutMotion };
