import { gsap } from 'gsap';
import { initFaqSections } from './faq.cjs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
initFaqSections(document, gsap, reducedMotion);
