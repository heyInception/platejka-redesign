import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initEmployeesMotion(root) {
  const heading = root.querySelector('[data-employees-heading]');
  const quoteMark = root.querySelector('[data-employees-quote-mark]');
  const text = root.querySelector('[data-employees-text]');
  const author = root.querySelector('[data-employees-author]');
  const image = root.querySelector('[data-employees-image]');
  const signature = root.querySelector('[data-employees-signature]');
  const signaturePaths = signature ? [...signature.querySelectorAll('path')] : [];
  const revealTargets = [heading, quoteMark, text, author, image, signature].filter(Boolean);

  if (!revealTargets.length) return null;

  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(revealTargets, { clearProps: 'all' });
    gsap.set(signaturePaths, { clearProps: 'all' });
  });

  media.add('(prefers-reduced-motion: no-preference)', () => {
    signaturePaths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        fillOpacity: 0,
        stroke: '#fff',
        strokeWidth: 0.8,
        strokeDasharray: length,
        strokeDashoffset: length,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      });
    });

    const timeline = gsap.timeline({
      defaults: { duration: 0.75, ease: 'power3.out' },
      scrollTrigger: {
        trigger: root,
        start: 'top 72%',
        once: true,
      },
    });

    timeline
      .from(heading, { autoAlpha: 0, y: 20 })
      .from(quoteMark, { autoAlpha: 0, y: 14, scale: 0.8 }, '<0.12')
      .from(text, { autoAlpha: 0, y: 28 }, '<0.08')
      .from(author, { autoAlpha: 0, y: 24 }, '<0.18')
      .from(image, { autoAlpha: 0, xPercent: 8, scale: 0.96, duration: 0.9 }, '<0.05')
      .to(signaturePaths, {
        strokeDashoffset: 0,
        duration: 1.35,
        stagger: 0.12,
        ease: 'power1.inOut',
      }, '<0.18')
      .to(signaturePaths, {
        fillOpacity: 1,
        strokeOpacity: 0,
        duration: 0.35,
        stagger: 0.06,
      }, '>-0.12');

    return () => timeline.kill();
  });

  return media;
}

document.querySelectorAll('[data-employees]').forEach((root) => {
  if (root.dataset.employeesReady === 'true') return;
  root.dataset.employeesReady = 'true';
  initEmployeesMotion(root);
});

export { initEmployeesMotion };
