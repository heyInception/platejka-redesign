import { gsap } from 'gsap';

const header = document.querySelector('.header');

if (header) {
  const logo = header.querySelector('.header__logo-link');
  const logoMarkParts = header.querySelectorAll('.header__logo-mark > path');
  const logoLetters = header.querySelectorAll('.header__logo-word > path');
  const menuToggles = [...header.querySelectorAll('.nav__toggle')];
  const menuControllers = [];
  const media = gsap.matchMedia();
  const reduceMotionQuery = '(prefers-reduced-motion: reduce)';
  const prefersReducedMotion = window.matchMedia(reduceMotionQuery).matches;

  const getMenuDepth = (toggle) => {
    let depth = 1;
    let list = toggle.closest('ul');

    while (list?.classList.contains('nav__submenu')) {
      depth += 1;
      list = list.parentElement.closest('ul');
    }

    return depth;
  };

  const closeMenu = (controller, closeDescendants = true) => {
    const { item, toggle, label, title, timeline } = controller;

    if (closeDescendants) {
      menuControllers
        .filter((other) => other !== controller && item.contains(other.item))
        .forEach((other) => closeMenu(other, false));
    }

    toggle.setAttribute('aria-expanded', 'false');
    label.textContent = `Открыть подменю «${title}»`;
    item.classList.remove('nav__item--open');
    timeline.reverse();
  };

  const openMenu = (controller) => {
    menuControllers
      .filter((other) => other !== controller && other.item.parentElement === controller.item.parentElement)
      .forEach((other) => closeMenu(other));

    const { item, toggle, label, title, timeline } = controller;
    toggle.setAttribute('aria-expanded', 'true');
    label.textContent = `Закрыть подменю «${title}»`;
    item.classList.add('nav__item--open');
    timeline.play();
  };

  menuToggles.forEach((toggle, index) => {
    const menuDepth = getMenuDepth(toggle);
    if (menuDepth > 2) return;

    const heading = toggle.parentElement;
    const item = heading.closest('li');
    const submenu = heading.nextElementSibling;
    if (!item || !submenu?.classList.contains('nav__submenu')) return;

    if (!submenu.id) submenu.id = `nav-submenu-${index + 1}`;
    toggle.setAttribute('aria-controls', submenu.id);

    const label = toggle.querySelector('.visually-hidden');
    const title = heading.querySelector('a').textContent.trim();
    const entries = submenu.querySelectorAll(':scope > li > .nav__sublink, :scope > li > .nav__subheading');
    const isNested = menuDepth === 2;
    const duration = prefersReducedMotion ? 0 : 0.28;

    gsap.set(submenu, {
      autoAlpha: 0,
      height: window.matchMedia('(max-width: 1024px)').matches ? 0 : 'auto',
      x: isNested && !prefersReducedMotion ? -10 : 0,
      y: !isNested && !prefersReducedMotion ? -10 : 0,
    });
    gsap.set(entries, { autoAlpha: 0, y: prefersReducedMotion ? 0 : -6 });

    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' },
      onStart: () => gsap.set(submenu, { pointerEvents: 'auto' }),
      onReverseComplete: () => gsap.set(submenu, { pointerEvents: 'none' }),
    })
      .to(submenu, { autoAlpha: 1, height: 'auto', x: 0, y: 0, duration })
      .to(entries, {
        autoAlpha: 1,
        y: 0,
        duration: prefersReducedMotion ? 0 : 0.2,
        stagger: prefersReducedMotion ? 0 : 0.035,
        onComplete: () => gsap.set(entries, { clearProps: 'opacity' }),
      }, '<0.06');

    const controller = { item, toggle, submenu, label, title, timeline };
    menuControllers.push(controller);

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu(controller) : openMenu(controller);
    });

    item.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch' && window.matchMedia('(min-width: 1025px)').matches) {
        openMenu(controller);
      }
    });

    item.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'touch' && window.matchMedia('(min-width: 1025px)').matches) {
        closeMenu(controller);
      }
    });

    item.addEventListener('focusin', () => {
      if (window.matchMedia('(min-width: 1025px)').matches) {
        openMenu(controller);
      }
    });
    item.addEventListener('focusout', (event) => {
      if (window.matchMedia('(min-width: 1025px)').matches && !item.contains(event.relatedTarget)) {
        closeMenu(controller);
      }
    });

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && window.matchMedia('(min-width: 1025px)').matches) {
        event.stopPropagation();
        closeMenu(controller);
        toggle.focus();
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!header.contains(event.target)) {
      menuControllers.forEach((controller) => closeMenu(controller));
    }
  });

  media.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduceMotion: reduceMotionQuery,
    },
    (context) => {
      if (context.conditions.reduceMotion) {
        const showLogo = () => gsap.set(logo, { autoAlpha: 1 });
        document.addEventListener('platejka:preloader-complete', showLogo, { once: true });

        return () => document.removeEventListener('platejka:preloader-complete', showLogo);
      }

      const playLogoIntro = () => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .set(logo, { autoAlpha: 1 })
          .from(logoMarkParts, {
          autoAlpha: 0,
          scale: 0.8,
          transformOrigin: '50% 50%',
          duration: 0.25,
          stagger: 0.035,
        })
        .from(logoLetters, {
          autoAlpha: 0,
          y: 8,
          duration: 0.22,
          stagger: 0.06,
        }, 0.18);

        return intro;
      };

      let intro;
      const startLogoIntro = () => {
        intro?.kill();
        intro = playLogoIntro();
      };

      document.addEventListener('platejka:preloader-complete', startLogoIntro, { once: true });

      const hover = gsap.timeline({
        paused: true,
        defaults: { duration: 0.24, ease: 'power2.out' },
      })
        .to(logoMarkParts, {
          scale: 1.06,
          stagger: { each: 0.035, from: 'center' },
          transformOrigin: '50% 50%',
        })
        .to(logoMarkParts, { scale: 1, stagger: 0.025 }, '>');

      const playLogoHover = () => hover.restart();
      logo.addEventListener('pointerenter', playLogoHover);

      return () => {
        document.removeEventListener('platejka:preloader-complete', startLogoIntro);
        logo.removeEventListener('pointerenter', playLogoHover);
        intro?.kill();
        hover.kill();
      };
    },
  );
}
