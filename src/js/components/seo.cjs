'use strict';

function initSeoSections(doc) {
  let count = 0;

  doc.querySelectorAll('[data-seo-section]').forEach((root) => {
    const button = root.querySelector('[data-seo-toggle]');
    const content = root.querySelector('[data-seo-content]');
    if (!button || !content) return;

    const render = (collapsed) => {
      content.hidden = collapsed;
      root.classList.toggle('is-collapsed', collapsed);
      button.setAttribute('aria-expanded', String(!collapsed));
      button.textContent = collapsed ? 'Показать ещё' : 'Скрыть';
    };

    render(true);
    button.hidden = false;
    button.addEventListener('click', () => render(!content.hidden));
    count += 1;
  });

  return count;
}

module.exports = { initSeoSections };
