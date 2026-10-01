import './_vendor';
import './components/horizontal-slider';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Keep the plugin in the shared dependency graph. Components that use it
// still register it locally, so they remain independently understandable.
void ScrollTrigger;
