import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCallForm, initCallMotion } from './call-motion.cjs';
import './phone-mask';

gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('[data-call]').forEach((root) => {
  initCallForm(root);

  const media = gsap.matchMedia();
  media.add({
    reduce: '(prefers-reduced-motion: reduce)',
    noPreference: '(prefers-reduced-motion: no-preference)',
  }, ({ conditions }) => {
    const animation = initCallMotion(root, gsap, conditions.reduce);
    return () => animation?.kill();
  });
});

export { initCallForm, initCallMotion };
