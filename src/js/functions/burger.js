// import { disableScroll } from '../functions/disable-scroll';
// import { enableScroll } from '../functions/enable-scroll';

(function(){
  const burger = document?.querySelector('[data-burger]');
  const menu = document?.querySelector('[data-menu]');
  const menuItems = document?.querySelectorAll('[data-menu-item]');
  const overlay = document?.querySelector('[data-menu-overlay]');
  const closeMenuButton = document?.querySelector('[data-close]');

  const toggleMenu = () => {
    burger?.classList.toggle('burger__active');
    menu?.classList.toggle('header__wrap_active');
    jQuery("[data-menu]").slideToggle(500).css("display", "block");

    if (menu?.classList.contains('menu--active')) {
      burger?.setAttribute('aria-expanded', 'true');
      burger?.setAttribute('aria-label', 'Закрыть меню');
      //disableScroll();
    } else {
      burger?.setAttribute('aria-expanded', 'false');
      burger?.setAttribute('aria-label', 'Открыть меню');
      //enableScroll();
    }
  };

  // Toggle menu when burger button is clicked
  burger?.addEventListener('click', (e) => {
    toggleMenu();
  });

  // Close menu when close menu button is clicked
  closeMenuButton?.addEventListener('click', () => {
    toggleMenu();
  });

  overlay?.addEventListener('click', () => {
    burger?.setAttribute('aria-expanded', 'false');
    burger?.setAttribute('aria-label', 'Открыть меню');
    burger.classList.remove('burger__active');
    menu.classList.remove('header__wrap_active');
    //enableScroll();
  });

  menuItems?.forEach(el => {
    el.addEventListener('click', () => {
      burger?.setAttribute('aria-expanded', 'false');
      burger?.setAttribute('aria-label', 'Открыть меню');
      burger.classList.remove('burger__active');
      menu.classList.remove('header__wrap_active');
      //enableScroll();
    });
  });
})();





