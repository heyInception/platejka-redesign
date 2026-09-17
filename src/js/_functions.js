
// Реализация бургер-меню
import './functions/burger';
// Реализация табов
import GraphTabs from 'graph-tabs';
const tabs = new GraphTabs('spec');
try {
  const selectElement = document.querySelector('#specialization'); // ID вашего select элемента

  selectElement.addEventListener('change', function () {
    const selectedValue = this.value;
    const index = Array.from(this.options).findIndex(option => option.value === selectedValue);

    if (index > -1) {
      const selectedTab = document.querySelector(`#spec${index + 1}`);
      const currentTab = document.querySelector('.tabs__nav-btn--active');

      if (selectedTab !== currentTab) {
        tabs.switchTabs(selectedTab, currentTab);
      }
    }
  });
} catch (error) {

}

// Подключение свайпера
import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs, Scrollbar } from 'swiper/modules';

let swiperSlider = new Swiper(".slider__start", {
  modules: [Navigation, Pagination],
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.slider__button_next',
    prevEl: '.slider__button_prev',
  },
  centeredSlides: false,
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 20
    },
    // when window width is >= 480px
    1230: {
      slidesPerView: 1,
      spaceBetween: 30
    },
    // when window width is >= 640px
    1231: {
      slidesPerView: 4,
      spaceBetween: 20
    }
  }
});


// Подключение анимаций по скроллу
// import AOS from 'aos';
// AOS.init();

// Подключение параллакса блоков при скролле
// import Rellax from 'rellax';
// const rellax = new Rellax('.rellax');

// Подключение плавной прокрутки к якорям
// import SmoothScroll from 'smooth-scroll';
// const scroll = new SmoothScroll('a[href*="#"]');

// Подключение событий свайпа на мобильных
// import 'swiped-events';
// document.addEventListener('swiped', function(e) {
//   console.log(e.target);
//   console.log(e.detail);
//   console.log(e.detail.dir);
// });

// import { validateForms } from './functions/validate-forms';
// const rules1 = [...];

// const afterForm = () => {
//   console.log('Произошла отправка, тут можно писать любые действия');
// };

// validateForms('.form-1', rules1, afterForm);

