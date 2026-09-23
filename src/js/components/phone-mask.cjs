const PHONE_MASK = '+7 (999) 999-99-99';

function initPhoneMasks(scope, Inputmask) {
  if (!scope?.querySelectorAll || typeof Inputmask !== 'function') return 0;

  const fields = [...scope.querySelectorAll('input.js-phone-mask')]
    .filter((field) => field.dataset.phoneMaskReady !== 'true');

  fields.forEach((field) => {
    const mask = new Inputmask(PHONE_MASK, {
      clearIncomplete: true,
      showMaskOnHover: false,
    });
    mask.mask(field);
    field.dataset.phoneMaskReady = 'true';
  });

  return fields.length;
}

module.exports = { initPhoneMasks, PHONE_MASK };
