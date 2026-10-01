import $ from 'jquery';

const SEARCH_PLACEHOLDER = 'Поиск страны';

function syncCountryFlag(select) {
  const wrap = select.closest('.calculator__select-wrap');
  const flagElement = wrap?.querySelector('[data-select-flag]');
  if (!wrap || !flagElement) return;

  const flag = select.selectedOptions[0]?.dataset.flag;
  flagElement.hidden = !flag;
  wrap.classList.toggle('has-no-flag', !flag);
  if (flag) flagElement.src = flag;
}

function initCalculatorSelect(select) {
  if (!select || typeof $.fn.select2 !== 'function') return;

  const $select = $(select);
  if ($select.data('select2')) return;

  const searchEnabled = select.dataset.searchEnabled === 'true';
  const $wrap = $select.closest('.calculator__select-wrap');

  $select.select2({
    dropdownParent: $wrap,
    minimumResultsForSearch: searchEnabled ? 0 : Infinity,
    width: '100%',
    language: {
      noResults: () => 'Страна не найдена',
    },
  });

  $select.on('change.calculatorSelect', () => syncCountryFlag(select));
  $select.on('select2:open.calculatorSelect', () => {
    if (!searchEnabled) return;

    $wrap.find('.select2-search__field')
      .attr('placeholder', SEARCH_PLACEHOLDER)
      .attr('aria-label', SEARCH_PLACEHOLDER);
  });

  syncCountryFlag(select);
}

document.querySelectorAll('[data-calculator-select]').forEach(initCalculatorSelect);

export { initCalculatorSelect, syncCountryFlag };
