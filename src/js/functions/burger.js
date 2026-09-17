import { gsap } from 'gsap';

const header = document.querySelector('.header');
const burger = header?.querySelector('[data-burger]');
const menu = header?.querySelector('[data-menu]');
const menuContent = menu?.querySelector('[data-menu-content]');
const mobileQuery = window.matchMedia('(max-width: 1024px)');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

if (header && burger && menu && menuContent) {
  let isOpen = false;
  let menuTween;

  const setMenuOffset = () => {
    menu.style.setProperty('--mobile-menu-top', `${header.getBoundingClientRect().bottom}px`);
  };

  const closeSubmenus = () => {
    menu.querySelectorAll('[data-nav-toggle][aria-expanded="true"]').forEach((toggle) => {
      toggle.click();
    });
  };

  const setOpenState = (nextOpen, returnFocus = false) => {
    if (!mobileQuery.matches && nextOpen) return;

    isOpen = nextOpen;
    menuTween?.kill();
    burger.classList.toggle('burger__active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    document.documentElement.classList.toggle('menu-open', isOpen);

    if (isOpen) {
      setMenuOffset();
      menu.classList.add('header__navigation--open');
      menuTween = gsap.fromTo(menu, {
        autoAlpha: 0,
        y: reduceMotionQuery.matches ? 0 : -12,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotionQuery.matches ? 0 : 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    } else {
      closeSubmenus();
      menuTween = gsap.to(menu, {
        autoAlpha: 0,
        y: reduceMotionQuery.matches ? 0 : -12,
        duration: reduceMotionQuery.matches ? 0 : 0.22,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => menu.classList.remove('header__navigation--open'),
      });

      if (returnFocus) burger.focus();
    }
  };

  burger.addEventListener('click', () => setOpenState(!isOpen));

  menu.addEventListener('click', (event) => {
    if (!mobileQuery.matches) return;

    const link = event.target.closest('a');
    if (link) setOpenState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      setOpenState(false, true);
    }
  });

  const resetForDesktop = (event) => {
    if (!event.matches) {
      isOpen = false;
      menuTween?.kill();
      closeSubmenus();
      burger.classList.remove('burger__active');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      document.documentElement.classList.remove('menu-open');
      menu.classList.remove('header__navigation--open');
      gsap.set(menu, { clearProps: 'opacity,visibility,transform' });
    }
  };

  mobileQuery.addEventListener('change', resetForDesktop);
  window.addEventListener('resize', () => {
    if (isOpen) setMenuOffset();
  });
}
