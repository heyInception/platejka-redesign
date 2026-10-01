const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const config = require('../sections.config');
const {
  buildWordPressAssets,
  createWebpackEntries,
  validateConfig,
} = require('../build/wordpress-build');

const projectRoot = path.resolve(__dirname, '..');

test('configuration covers every visual partial and groups markup variants', () => {
  const sections = validateConfig(config, projectRoot);
  const names = sections.map((section) => section.name);

  assert.equal(sections.length, 30);
  assert.equal(names.includes('head'), false);
  assert.deepEqual(
    sections.find((section) => section.name === 'hero').html.map((file) => path.basename(file)),
    ['hero.html', 'hero-main.html'],
  );
  assert.deepEqual(
    sections.find((section) => section.name === 'call').html.map((file) => path.basename(file)),
    ['call.html', 'call-about.html'],
  );
  assert.equal(sections.find((section) => section.name === 'footer').script, null);
});

test('validation rejects a configured source that does not exist', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-config-'));
  fs.mkdirSync(path.join(fixtureRoot, 'src', 'partials'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'src', 'partials', 'demo.html'), '<section></section>');

  assert.throws(
    () => validateConfig({ sections: [{ name: 'demo', html: ['src/partials/demo.html'], style: 'missing.scss', script: null, assets: [] }] }, fixtureRoot),
    /demo.*style.*missing\.scss/i,
  );
});

test('validation rejects duplicate component names', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-duplicate-'));
  fs.mkdirSync(path.join(fixtureRoot, 'src', 'partials'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'src', 'partials', 'demo.html'), '<section></section>');
  const section = { name: 'demo', html: ['src/partials/demo.html'], style: null, script: null, assets: [] };

  assert.throws(
    () => validateConfig({ sections: [section, section] }, fixtureRoot),
    /duplicate.*demo/i,
  );
});

test('build emits portable HTML, CSS, images, and a deterministic manifest', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-build-'));
  const outputDir = path.join(fixtureRoot, 'wordpress');
  const files = {
    'src/partials/demo.html': '<section class="demo">\n  @include("nested/picture.html")\n</section>\n',
    'src/partials/nested/picture.html': '<img src="../img/demo/picture.svg" alt="">',
    'src/scss/common.scss': '.ui-button { display: flex; }\n',
    'src/scss/components/_demo.scss': '.demo { background: url("../../img/demo/picture.svg") no-repeat; user-select: none; }\n',
    'src/img/demo/picture.svg': '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n',
  };
  Object.entries(files).forEach(([relativePath, contents]) => {
    const filename = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, contents);
  });

  const fixtureConfig = {
    common: { style: 'src/scss/common.scss', script: null, assets: [] },
    sections: [{
      name: 'demo',
      html: ['src/partials/demo.html'],
      style: 'src/scss/components/_demo.scss',
      script: null,
      assets: ['src/img/demo'],
    }],
  };

  const manifest = await buildWordPressAssets({
    config: fixtureConfig,
    rootDir: fixtureRoot,
    outputDir,
  });

  const html = fs.readFileSync(path.join(outputDir, 'sections/demo/demo.html'), 'utf8');
  const css = fs.readFileSync(path.join(outputDir, 'sections/demo/demo.css'), 'utf8');
  assert.match(html, /\n  <img src="img\/demo\/picture\.svg"/);
  assert.doesNotMatch(html, /@include/);
  assert.match(css, /url\(["']?img\/demo\/picture\.svg["']?\)/);
  assert.match(css, /-webkit-user-select:none/);
  assert.equal(fs.existsSync(path.join(outputDir, 'sections/demo/demo.js')), false);
  assert.equal(fs.existsSync(path.join(outputDir, 'sections/demo/img/demo/picture.svg')), true);
  assert.deepEqual(manifest, {
    version: 1,
    common: {
      css: 'common/common.css',
      js: null,
      assets: [],
    },
    sections: {
      demo: {
        html: ['sections/demo/demo.html'],
        css: 'sections/demo/demo.css',
        js: null,
        assets: ['sections/demo/img/demo/picture.svg'],
        dependencies: ['common'],
      },
    },
  });
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8')),
    manifest,
  );
});

test('build fails when a section references an image outside its declared assets', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-missing-asset-'));
  const htmlFile = path.join(fixtureRoot, 'src/partials/demo.html');
  fs.mkdirSync(path.dirname(htmlFile), { recursive: true });
  fs.writeFileSync(htmlFile, '<section><img src="../img/demo/missing.svg" alt=""></section>\n');
  const fixtureConfig = {
    common: { style: null, script: null, assets: [] },
    sections: [{ name: 'demo', html: ['src/partials/demo.html'], style: null, script: null, assets: [] }],
  };

  await assert.rejects(
    buildWordPressAssets({ config: fixtureConfig, rootDir: fixtureRoot, outputDir: path.join(fixtureRoot, 'wordpress') }),
    /demo.*undeclared local asset.*img\/demo\/missing\.svg/i,
  );
});

test('build refuses to recursively clean the source root', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-safe-output-'));
  const htmlFile = path.join(fixtureRoot, 'src/partials/demo.html');
  fs.mkdirSync(path.dirname(htmlFile), { recursive: true });
  fs.writeFileSync(htmlFile, '<section></section>\n');
  const fixtureConfig = {
    common: { style: null, script: null, assets: [] },
    sections: [{ name: 'demo', html: ['src/partials/demo.html'], style: null, script: null, assets: [] }],
  };

  await assert.rejects(
    buildWordPressAssets({ config: fixtureConfig, rootDir: fixtureRoot, outputDir: fixtureRoot }),
    /output directory must be a child of the project root/i,
  );
});

test('build rejects recursive HTML includes with a readable error', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-include-cycle-'));
  const htmlFile = path.join(fixtureRoot, 'src/partials/demo.html');
  fs.mkdirSync(path.dirname(htmlFile), { recursive: true });
  fs.writeFileSync(htmlFile, '<section>@include("demo.html")</section>\n');
  const fixtureConfig = {
    common: { style: null, script: null, assets: [] },
    sections: [{ name: 'demo', html: ['src/partials/demo.html'], style: null, script: null, assets: [] }],
  };

  await assert.rejects(
    buildWordPressAssets({ config: fixtureConfig, rootDir: fixtureRoot, outputDir: path.join(fixtureRoot, 'wordpress') }),
    /recursive HTML include.*demo\.html/i,
  );
});

test('common font URLs resolve inside the portable common package', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-font-'));
  const files = {
    'src/scss/common.scss': '@font-face { font-family: Demo; src: url("../fonts/Demo.woff2"); }\n',
    'src/resources/fonts/Demo.woff2': 'font-data',
  };
  Object.entries(files).forEach(([relativePath, contents]) => {
    const filename = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, contents);
  });
  const outputDir = path.join(fixtureRoot, 'wordpress');

  await buildWordPressAssets({
    config: {
      common: { style: 'src/scss/common.scss', script: null, assets: ['src/resources/fonts'] },
      sections: [],
    },
    rootDir: fixtureRoot,
    outputDir,
  });

  const css = fs.readFileSync(path.join(outputDir, 'common/common.css'), 'utf8');
  assert.match(css, /url\(["']?fonts\/Demo\.woff2["']?\)/);
  assert.equal(fs.existsSync(path.join(outputDir, 'common/fonts/Demo.woff2')), true);
});

test('webpack entries make every section script depend on the shared bundle', () => {
  const entries = createWebpackEntries(config, projectRoot);

  assert.deepEqual(entries.common, {
    import: [path.join(projectRoot, 'src/js/wordpress-common.js')],
  });
  assert.deepEqual(entries.hero, {
    import: [
      path.join(projectRoot, 'src/js/components/hero.js'),
      path.join(projectRoot, 'src/js/components/calculator-select.js'),
    ],
    dependOn: 'common',
  });
  assert.equal(Object.hasOwn(entries, 'footer'), false);
});

test('build emits classic common and section JavaScript bundles', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'platejka-wordpress-js-'));
  const outputDir = path.join(fixtureRoot, 'wordpress');
  const files = {
    'src/partials/demo.html': '<section data-demo></section>\n',
    'src/js/common.js': 'window.demoShared = true;\n',
    'src/js/demo.js': 'document.querySelectorAll("[data-demo]").forEach((root) => { root.dataset.ready = "true"; });\n',
  };
  Object.entries(files).forEach(([relativePath, contents]) => {
    const filename = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, contents);
  });
  const fixtureConfig = {
    common: { style: null, script: 'src/js/common.js', assets: [] },
    sections: [{
      name: 'demo',
      html: ['src/partials/demo.html'],
      style: null,
      script: 'src/js/demo.js',
      assets: [],
    }],
  };

  const manifest = await buildWordPressAssets({ config: fixtureConfig, rootDir: fixtureRoot, outputDir });

  assert.equal(fs.existsSync(path.join(outputDir, 'common/common.js')), true);
  assert.equal(fs.existsSync(path.join(outputDir, 'sections/demo/demo.js')), true);
  assert.equal(manifest.common.js, 'common/common.js');
  assert.equal(manifest.sections.demo.js, 'sections/demo/demo.js');
});

test('npm exposes a dedicated WordPress build command', () => {
  const packageJson = require('../package.json');

  assert.equal(packageJson.scripts['build:wordpress'], 'gulp wordpress');
});

test('project configuration builds representative WordPress component packages', { timeout: 30000 }, async () => {
  const temporaryRoot = fs.mkdtempSync(path.join(projectRoot, '.wordpress-smoke-'));
  const outputDir = path.join(temporaryRoot, 'wordpress');
  const manifest = await buildWordPressAssets({ config, rootDir: projectRoot, outputDir });

  assert.equal(Object.keys(manifest.sections).length, 30);
  assert.deepEqual(manifest.sections.hero.html, [
    'sections/hero/hero.html',
    'sections/hero/hero-main.html',
  ]);
  assert.equal(manifest.sections.hero.css, 'sections/hero/hero.css');
  assert.equal(manifest.sections.hero.js, 'sections/hero/hero.js');
  assert.equal(manifest.sections.footer.js, null);
  assert.equal(fs.existsSync(path.join(outputDir, 'common/common.js')), true);
  assert.equal(fs.existsSync(path.join(outputDir, 'sections/hero/img/hero-bg.png')), true);
  assert.equal(JSON.stringify(manifest).includes('\\\\'), false);
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
});
