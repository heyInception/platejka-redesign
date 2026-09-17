# Платёжка

Frontend-проект сайта [platejka.com](https://platejka.com/) на Gulp, SCSS и JavaScript с GSAP-анимациями.

## Начало работы

Требования: Node.js и npm.

```bash
git clone https://github.com/heyInception/platejka-redesign.git
cd platejka-redesign
npm install
npm run dev
```

Собранные файлы сохраняются в каталоге `app`.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запускает dev-сборку и BrowserSync. |
| `npm test` | Запускает автоматические тесты проекта. |
| `npm run build` | Создаёт оптимизированную production-сборку. |
| `npm run backend` | Создаёт несжатую сборку для интеграции с backend. |
| `npm run cache` | Добавляет хеши к ассетам после production-сборки. |
| `npm run zip` | Упаковывает собранный проект в ZIP-архив. |
| `npm run html` | Проверяет HTML валидатором. |
| `npm run code` | Проверяет форматирование EditorConfig. |

## Реализованные компоненты

### Шапка и навигация

- Desktop-навигация и полноэкранное мобильное меню для ширины `1024px` и меньше.
- Бургер размером `20 × 20px` с двумя линиями по `15px` и анимацией в крестик.
- Адаптивная трёхуровневая навигация с независимыми ссылками и кнопками раскрытия.
- На desktop меню открывается по наведению, фокусу и нажатию; на мобильных устройствах уровни работают как аккордеон.
- Мобильная панель имеет собственную прокрутку и блокирует прокрутку страницы.
- Закрытие по конечной ссылке, клику вне desktop-меню, клавише `Escape` и переходу на desktop-размер.
- Синхронизация `aria-expanded` и доступных подписей кнопок.
- GSAP-анимация панели, выпадающих пунктов и логотипа.
- Поддержка `prefers-reduced-motion`.
- Адаптивные стили подключены через миксины из `src/scss/mixins/_breakpoint.scss`.

### Прелоадер

- Полноэкранный фирменный прелоадер с логотипом.
- Восемь вертикальных секций заполняются попарно через GSAP.
- После заполнения запускается зелёная шторка и плавно появляется страница.
- Логотип в шапке изначально скрыт и анимируется только после завершения прелоадера, без вспышки конечного состояния.
- Повторный показ ограничен cookie `platejka-preloader-viewed`.
- Срок жизни cookie — 24 часа (`Max-Age=86400`, `Path=/`, `SameSite=Lax`).
- Если cookie недоступны, прелоадер продолжает работать без ошибки.
- При `prefers-reduced-motion: reduce` длительная анимация пропускается.

### Hero и калькулятор платежа

- Адаптивный Hero собран для desktop и mobile; контентная панель, изображение и blur анимируются через GSAP после события `platejka:ready`.
- Калькулятор поддерживает CNY и USD. При сумме меньше `3000` комиссия равна `275` единицам выбранной валюты, начиная с `3000` — `0,5%` от суммы.
- Курс конвертации и комиссия учитывают коэффициент `1.01`; кнопка расчёта открывает нативный `<dialog>` с итогами.
- Заголовок разделён на поля `.hero__title-primary` и `.hero__title-secondary`, поэтому цветную часть можно независимо заполнять из ACF.
- Фоновые изображения остаются в inline CSS-переменных `--hero-image` и `--hero-blur`, что позволяет выводить URL из WordPress без генерации отдельных CSS-классов.
- Курсы передаются в JSON-атрибуте `data-currency-rates`, например `{"CNY":12.3,"USD":81.0929}`. Перед выводом в WordPress значение нужно пропускать через `wp_json_encode()` и `esc_attr()`.

Рекомендуемые ACF-поля: `hero_title_primary`, `hero_title_secondary`, `hero_description`, `hero_background`, `hero_blur`, `hero_currency_rates`, карточки преимуществ и подписи калькулятора. Структуру HTML и `data-*`-атрибуты при интеграции следует сохранить — JavaScript не зависит от конкретных текстов.

### UI-kit

В глобальных стилях доступны базовые компоненты и состояния:

- кнопки `.ui-button` размеров `medium` и `small`;
- варианты кнопок `secondary` и `overlay`;
- ссылки `.ui-link` с вариантами `brand`, `overlay` и `small`;
- вкладки `.ui-tabs` и `.ui-tab`;
- select `.ui-select`;
- текстовое поле `.ui-input`;
- поле суммы `.ui-amount-input`;
- состояния hover, focus, disabled, selected и invalid.

Цвета компонентов используют CSS-переменные из `src/scss/_vars.scss`.

## Структура проекта

```text
├── src/
│   ├── img/                         # Изображения и SVG
│   ├── js/
│   │   ├── components/
│   │   │   ├── header.js            # Навигация и анимация логотипа
│   │   │   ├── hero.js              # Калькулятор, диалог и GSAP-анимация Hero
│   │   │   ├── hero-calculator.cjs   # Чистая модель расчёта
│   │   │   ├── preloader.js         # GSAP-таймлайн прелоадера
│   │   │   └── preloader-state.cjs  # Cookie-состояние прелоадера
│   │   ├── _components.js           # Подключение компонентов
│   │   ├── _functions.js            # Общие функции
│   │   └── main.js                  # Точка входа JavaScript
│   ├── partials/
│   │   ├── head.html
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── hero.html
│   │   └── preloader.html
│   ├── resources/                   # Шрифты и прочие ресурсы
│   ├── scss/
│   │   ├── components/
│   │   │   ├── _header.scss
│   │   │   ├── _hero.scss
│   │   │   └── _preloader.scss
│   │   ├── mixins/
│   │   │   ├── _breakpoint.scss     # Адаптивные breakpoint-миксины
│   │   │   └── _burger.scss         # Геометрия и состояния бургера
│   │   ├── _settings.scss           # Глобальные стили и UI-kit
│   │   ├── _vars.scss               # CSS-переменные
│   │   └── main.scss                # Точка входа SCSS
│   ├── china.html
│   └── index.html
├── tests/
│   ├── header-menu.test.cjs
│   ├── header.test.cjs
│   ├── preloader.test.cjs
│   ├── hero-calculator.test.cjs
│   ├── hero.test.cjs
│   └── ui-components.test.cjs
├── gulpfile.js
├── package.json
└── README.md
```

## Проверка

Запуск всех автоматических тестов:

```bash
npm test
```

Проверка production-сборки:

```bash
npm run build
```

На текущем этапе тесты проверяют:

- семантику и доступность навигации;
- размеры и состояния бургера;
- структуру мобильного меню, вложенные уровни и breakpoint-миксины;
- GSAP-настройки и поддержку reduced motion;
- отсутствие вспышки логотипа до завершения прелоадера;
- установку и срок действия cookie прелоадера;
- варианты и доступные состояния UI-компонентов.
