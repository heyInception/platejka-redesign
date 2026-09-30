const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const partial = (name) => cheerio.load(read(`src/partials/${name}.html`));

test('location exposes the Figma content order, four office slides and an empty map mount', () => {
  const $ = partial('location');
  const section = $('.location');
  const layoutChildren = $('.location__layout').children().map((_, element) => $(element).attr('class')).get();

  assert.equal(section.attr('aria-labelledby'), 'location-title');
  assert.equal(section.attr('data-horizontal-slider-min-controls'), '4');
  assert.notEqual(section.attr('data-horizontal-slider-desktop-controls'), undefined);
  assert.deepEqual(layoutChildren, ['location__content', 'location__map', 'location__gallery']);
  assert.equal(section.find('[data-horizontal-slider-slide]').length, 4);
  assert.equal(section.find('.location__contact-icon[aria-hidden="true"]').length, 2);
  assert.equal(section.find('[data-horizontal-slider-controls] button').length, 2);
  assert.equal(section.find('[data-location-map]').attr('id'), 'yamap');
  assert.equal(section.find('[data-location-map]').children().length, 0);
  assert.equal(section.find('img[src*="map"]').length, 0);
});

test('location compiles to the Figma desktop grid and mobile content order', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.location__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 688px\) minmax\(0, 592px\)[^}]*gap:\s*40px 32px/s);
  assert.match(css, /\.location__map\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*1\s*\/\s*span 2[^}]*min-height:\s*632px/s);
  assert.match(css, /\.location \.slider-controls\s*\{[^}]*margin-top:\s*40px[^}]*width:\s*max-content/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.location__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*gap:\s*24px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.location__map\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*2[^}]*min-height:\s*383px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.location__gallery\s*\{[^}]*grid-row:\s*3/s);
});

test('infrastructure contains specializations, three facts and all legal entities', () => {
  const $ = partial('infrastructure');
  assert.equal($('.infrastructure').attr('aria-labelledby'), 'infrastructure-title');
  assert.equal($('.infrastructure__fact').length, 3);
  assert.equal($('.infrastructure__entity').length, 11);
  assert.match($.text(), /Ключевые специализации/);

  const flags = $('.infrastructure__entity').map((_, element) => ({
    country: $(element).find('.infrastructure__entity-name').text().trim(),
    src: $(element).find('img').attr('src'),
  })).get();

  assert.deepEqual(flags, [
    { country: 'Эстония', src: 'img/destinations/flags-38.png' },
    { country: 'Индонезия', src: 'img/infrastructure/flag-indonesia.svg' },
    { country: 'Россия', src: 'img/destinations/flags-4.png' },
    { country: 'Китай', src: 'img/destinations/flags-1.png' },
    { country: 'США', src: 'img/destinations/flags-16.png' },
    { country: 'Чехия', src: 'img/destinations/flags-34.png' },
    { country: 'Германия', src: 'img/destinations/flags-19.png' },
    { country: 'Таиланд', src: 'img/destinations/flags-23.png' },
    { country: 'Турция', src: 'img/destinations/flags-7.png' },
    { country: 'ОАЭ', src: 'img/destinations/flags-45.png' },
    { country: 'Казахстан', src: 'img/destinations/flags-22.png' },
  ]);
});

test('infrastructure compiles to the Figma desktop cards and compact mobile entity grid', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.infrastructure__fact\s*\{[^}]*width:\s*222\.333px[^}]*min-height:\s*136px/s);
  assert.match(css, /\.infrastructure__fact strong\s*\{[^}]*font:\s*700 44px\s*\/\s*48px/s);
  assert.match(css, /\.infrastructure__entity:nth-child\(4\)\s*\{[^}]*left:\s*802px[^}]*top:\s*157\.745px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.infrastructure__entity-name\s*\{[^}]*position:\s*absolute[^}]*clip:\s*rect\(0 0 0 0\)/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.infrastructure__network > img\s*\{[^}]*height:\s*164px[^}]*filter:\s*blur\(100px\)/s);
});

test('financial section contains compliance workflow, case, seven banks and test payment callout', () => {
  const $ = partial('financial');
  const caseChildren = $('.financial__case').children().map((_, element) => $(element).attr('class')).get();

  assert.equal($('.financial').attr('aria-labelledby'), 'financial-title');
  assert.equal($('.financial__benefit').length, 3);
  assert.equal($('.financial__bank').length, 7);
  assert.deepEqual(caseChildren, ['financial__labels', 'financial__case-copy', 'financial__case-image', 'financial__case-logo']);
  assert.equal($('.financial__benefit img[src*="financial/item-main-"]').length, 3);
  assert.equal($('.financial__bank img[src*="financial/bank-main-"]').length, 7);
  assert.equal($('.financial__test-image[src$="test-main-img.png"]').length, 1);
  assert.match($.text(), /Решили за 24 часа/);
  assert.match($.text(), /Возможность тестового платежа/);
});

test('financial compiles to the Figma grid while every content card remains height-flexible', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  const desktopCards = css.match(/\.financial__case,\s*\.financial__banks\s*\{([^}]*)\}/s)?.[1] ?? '';
  const desktopCase = css.match(/\.financial__case\s*\{([^}]*)\}/s)?.[1] ?? '';
  const desktopBanks = css.match(/\.financial__banks\s*\{([^}]*)\}/s)?.[1] ?? '';
  const desktopTest = css.match(/\.financial__test\s*\{([^}]*)\}/s)?.[1] ?? '';

  assert.match(css, /\.financial__layout\s*\{[^}]*grid-template-columns:\s*565px minmax\(0, 715px\)[^}]*gap:\s*32px/s);
  assert.match(desktopCards, /border-radius:\s*24px/);
  assert.match(desktopCards, /padding:\s*40px/);
  assert.match(desktopTest, /min-height:\s*300px/);
  assert.doesNotMatch(desktopCards, /(?:^|[;\s])(?:height|max-height):/);
  assert.doesNotMatch(desktopCase, /(?:^|[;\s])(?:height|max-height):/);
  assert.doesNotMatch(desktopBanks, /(?:^|[;\s])(?:height|max-height):/);
  assert.doesNotMatch(desktopTest, /(?:^|[;\s])(?:height|max-height):/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.financial__case,\s*\.financial__banks\s*\{[^}]*border-radius:\s*16px[^}]*padding:\s*16px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.financial__test-image\s*\{[^}]*display:\s*none/s);
});

test('employees is a static semantic testimonial without slider controls', () => {
  const $ = partial('employees');
  assert.equal($('.employees').attr('aria-labelledby'), 'employees-title');
  assert.notEqual($('.employees').attr('data-employees'), undefined);
  assert.equal($('[data-horizontal-slider]').length, 0);
  assert.equal($('[data-horizontal-slider-prev], [data-horizontal-slider-next]').length, 0);
  assert.equal($('.employees__blockquote').length, 1);
  assert.equal($('.employees__blockquote > footer.employees__author').length, 1);
  assert.equal($('.employees__quote-mark[src$="ps.svg"][alt=""]').length, 1);
  assert.equal($('svg[data-employees-signature] path').length, 3);
  assert.equal($('[data-employees-image][width="584"][height="426"]').length, 1);
  assert.match($.text(), /Клочков Михаил/);
});

test('employees matches the Figma grids while its content height remains flexible', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  const panel = css.match(/\.employees__panel\s*\{([^}]*)\}/s)?.[1] ?? '';
  const quote = css.match(/\.employees__quote\s*\{([^}]*)\}/s)?.[1] ?? '';

  assert.match(panel, /border-radius:\s*36px/);
  assert.match(panel, /padding:\s*96px 0/);
  assert.match(css, /\.employees__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 688px\) minmax\(0, 584px\)[^}]*gap:\s*40px/s);
  assert.match(css, /\.employees__image\s*\{[^}]*border-radius:\s*24px[^}]*aspect-ratio:\s*584\s*\/\s*426/s);
  assert.doesNotMatch(panel, /(?:^|[;\s])(?:height|min-height|max-height):/);
  assert.doesNotMatch(quote, /(?:^|[;\s])(?:height|min-height|max-height):/);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.employees__panel\s*\{[^}]*border-radius:\s*24px[^}]*padding:\s*36px 16px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.employees__image\s*\{[^}]*aspect-ratio:\s*343\s*\/\s*320/s);
});

test('employees motion is wired to one-shot ScrollTrigger and reduced-motion fallback', () => {
  const entry = read('src/js/_components.js');
  const motion = read('src/js/components/employees.js');

  assert.match(entry, /import '\.\/components\/employees';/);
  assert.match(motion, /gsap\.registerPlugin\(ScrollTrigger\)/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);
  assert.match(motion, /getTotalLength\(\)/);
  assert.match(motion, /strokeDashoffset:\s*0/);
  assert.match(motion, /once:\s*true/);
});

test('exhibitions is an overflowing four-card slider with mobile-hidden controls', () => {
  const $ = partial('exhibitions');
  assert.equal($('.exhibitions').attr('aria-labelledby'), 'exhibitions-title');
  assert.equal($('[data-horizontal-slider-slide]').length, 4);
  assert.notEqual($('.exhibitions').attr('data-horizontal-slider-desktop-controls'), undefined);
  assert.notEqual($('.exhibitions').attr('data-horizontal-slider-align-every-slide'), undefined);
});

test('exhibitions compiles to the Figma desktop and tablet measurements', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;

  assert.match(css, /\.exhibitions__trademark\s*\{[^}]*border-radius:\s*24px[^}]*padding:\s*8px[^}]*width:\s*416px/s);
  assert.match(css, /\.exhibitions__track\s*\{[^}]*gap:\s*16px/s);
  assert.match(css, /\.exhibitions__track img\s*\{[^}]*border-radius:\s*24px[^}]*width:\s*400px[^}]*height:\s*428px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.exhibitions__trademark\s*\{[^}]*width:\s*100%/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.exhibitions__trademark img\s*\{[^}]*width:\s*96px[^}]*height:\s*96px/s);
});

test('developing exposes every year as an independently reachable slide', () => {
  const $ = partial('developing');
  assert.equal($('.developing').attr('aria-labelledby'), 'developing-title');
  assert.notEqual($('.developing').attr('data-horizontal-slider-align-every-slide'), undefined);
  assert.equal($('.developing').attr('data-horizontal-slider-min-controls'), undefined);
  assert.equal($('.developing').attr('data-horizontal-slider-desktop-controls'), undefined);
  assert.equal($('[data-horizontal-slider-go-to]').length, 7);
  assert.equal($('[data-horizontal-slider-slide]').length, 7);
  assert.equal($('.developing__card > .developing__copy').length, 7);
  assert.equal($('.developing__card > img[width="429"][height="504"][alt=""]').length, 7);
  assert.equal($('[data-horizontal-slider-controls]').attr('hidden'), undefined);
});

test('developing compiles to the Figma cards with flexible content height', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  const desktopCard = css.match(/\.developing__card\s*\{([^}]*)\}/s)?.[1] ?? '';
  const desktopCopy = css.match(/\.developing__copy\s*\{([^}]*)\}/s)?.[1] ?? '';
  const desktopNavigation = css.match(/\.developing__navigation\s*\{([^}]*)\}/s)?.[1] ?? '';
  const desktopContainer = css.match(/\.developing \.container\s*\{([^}]*)\}/s)?.[1] ?? '';

  assert.match(css, /\.developing\s*\{[^}]*background:\s*var\(--surface-secondary\)/s);
  assert.match(desktopCard, /grid-template-columns:\s*429px 429px/);
  assert.match(desktopCard, /border-radius:\s*32px/);
  assert.match(desktopCard, /padding:\s*48px/);
  assert.match(desktopCard, /width:\s*986px/);
  assert.match(desktopCard, /min-height:\s*600px/);
  assert.doesNotMatch(desktopCopy, /(?:^|[;\s])(?:height|max-height):/);
  assert.match(desktopNavigation, /justify-content:\s*center/);
  assert.match(desktopNavigation, /width:\s*100%/);
  assert.doesNotMatch(desktopNavigation, /max-width:\s*max-content/);
  assert.match(desktopContainer, /grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.developing__image\s*\{[^}]*border-radius:\s*24px[^}]*width:\s*429px[^}]*height:\s*504px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.developing__card\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*border-radius:\s*24px[^}]*padding:\s*24px[^}]*width:\s*359px[^}]*min-height:\s*600px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.developing__image\s*\{[^}]*width:\s*100%[^}]*height:\s*300px/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.developing__navigation\s*\{[^}]*display:\s*contents/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.developing__arrow--previous\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*4/s);
});

test('about call keeps the form and adds two lower contact cards', () => {
  const $ = partial('call-about');
  assert.equal($('.call__form form').length, 1);
  assert.equal($('.call-about__card').length, 2);
  assert.equal($('.call-about__card').first().find('img[src*="call-about/"]').length, 2);
  assert.equal($('.call-about__card').last().find('img[src*="call-about/"]').length, 5);
  assert.equal($('img[src*="call-about/whatsapp.svg"]').length, 1);
  assert.match($.text(), /Свяжитесь с нами/);
  assert.match($.text(), /Читайте нас в соцсетях/);
});

test('about sections switch at tablet and keep slider content flexible', () => {
  const css = sass.compile(path.join(root, 'src/scss/main.scss')).css;
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.location/);
  assert.match(css, /\.exhibitions__track\s*\{[^}]*width:\s*max-content/s);
  assert.match(css, /\.developing__track\s*\{[^}]*width:\s*max-content/s);
  assert.match(css, /@media \(max-width:\s*1024px\)[\s\S]*?\.developing[^}]*[\s\S]*?\.developing__navigation\s*\{[^}]*display:\s*contents/s);
});
