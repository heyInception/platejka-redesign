const partial = (name) => `src/partials/${name}.html`;
const style = (name) => `src/scss/components/_${name}.scss`;
const script = (name) => `src/js/components/${name}.js`;
const imageDirectory = (name) => `src/img/${name}`;

const section = (name, options = {}) => ({
  name,
  html: (options.variants || [name]).map(partial),
  style: options.style === null ? null : style(options.style || name),
  script: options.scriptPaths || (options.script === undefined
    ? null
    : Array.isArray(options.script)
      ? options.script.map(script)
      : script(options.script)),
  assets: options.assets || [],
});

module.exports = {
  common: {
    style: 'src/scss/wordpress-common.scss',
    script: 'src/js/wordpress-common.js',
    assets: ['src/resources/fonts'],
  },
  sections: [
    section('about', { script: 'about', assets: ['src/img/about-img.png', 'src/img/about-sro.png', 'src/img/cb-img.png', 'src/img/svg'] }),
    section('about-hero', { script: 'about-hero', assets: [imageDirectory('about-hero')] }),
    section('calculator', { script: ['hero', 'calculator-select'], assets: ['src/img/ru-flag.png', 'src/img/cn-flag.png', 'src/img/eur-flag.png', 'src/img/usa-flag.png', 'src/img/Shield-Check.svg', 'src/img/svg'] }),
    section('call', { variants: ['call', 'call-about'], script: 'call', assets: ['src/img/call-bg.jpg', imageDirectory('call-about'), 'src/img/hero__trust-years-left.svg', 'src/img/hero__trust-years-right.svg', 'src/img/registry.png', 'src/img/associations.png', 'src/img/svg'] }),
    section('cases', { assets: [imageDirectory('cases')] }),
    section('compliance', { script: 'compliance', assets: [imageDirectory('compliance')] }),
    section('destinations', { script: 'destinations', assets: [imageDirectory('destinations')] }),
    section('developing', { assets: [imageDirectory('developing')] }),
    section('documents', { script: 'documents', assets: [imageDirectory('documents')] }),
    section('employees', { script: 'employees', assets: [imageDirectory('employees')] }),
    section('exhibitions', { assets: [imageDirectory('exhibitions')] }),
    section('faq', { script: 'faq' }),
    section('financial', { assets: [imageDirectory('financial'), 'src/img/svg'] }),
    section('footer', { assets: ['src/img/footerLogo.svg', 'src/img/svg'] }),
    section('guarantees', { script: 'guarantees', assets: [imageDirectory('guarantees'), 'src/img/Shield-Check.svg', 'src/img/svg'] }),
    section('header', { scriptPaths: ['src/js/components/header.js', 'src/js/functions/burger.js'], assets: ['src/img/svg'] }),
    section('hero', { variants: ['hero', 'hero-main'], script: ['hero', 'calculator-select'], assets: ['src/img/china-hero-bg.png', 'src/img/china-hero-blur.png', 'src/img/hero-bg.png', 'src/img/hero-blur.png', 'src/img/ru-flag.png', 'src/img/cn-flag.png', 'src/img/eur-flag.png', 'src/img/usa-flag.png', 'src/img/registry.png', 'src/img/associations.png', 'src/img/hero__trust-years-left.png', 'src/img/hero__trust-years-left.svg', 'src/img/hero__trust-years-right.svg', 'src/img/Shield-Check.svg', 'src/img/svg'] }),
    section('infrastructure', { assets: [imageDirectory('infrastructure'), imageDirectory('destinations')] }),
    section('location', { script: 'location-map', assets: [imageDirectory('location'), 'src/img/svg'] }),
    section('preloader', { script: 'preloader' }),
    section('problems', { script: 'problems', assets: [imageDirectory('problems')] }),
    section('protection', { assets: [imageDirectory('protection')] }),
    section('review', { script: 'review', assets: [imageDirectory('review')] }),
    section('review-main', { script: 'review', assets: [imageDirectory('review')] }),
    section('seo', { script: 'seo' }),
    section('serves', { assets: [imageDirectory('serves')] }),
    section('shipments', { script: 'shipments', assets: [imageDirectory('shipments')] }),
    section('table', { assets: [imageDirectory('table'), 'src/img/footerLogo.svg'] }),
    section('with-us', { assets: [imageDirectory('with-us')] }),
    section('work', { assets: [imageDirectory('work'), imageDirectory('problems')] }),
  ],
};
