const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

const toPosix = (value) => value.split(path.sep).join('/');

const optionalSource = (value, field, sectionName, rootDir, allowEmpty = false) => {
  if (value === null) return null;

  const values = Array.isArray(value) ? value : [value];
  if (values.length === 0 && !allowEmpty) {
    throw new Error(`Section "${sectionName}" has an empty ${field} list`);
  }

  const resolved = values.map((file) => {
    if (typeof file !== 'string' || file.length === 0) {
      throw new Error(`Section "${sectionName}" has an invalid ${field} source`);
    }
    const absolute = path.resolve(rootDir, file);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Section "${sectionName}" ${field} source does not exist: ${file}`);
    }
    return absolute;
  });

  return Array.isArray(value) ? resolved : resolved[0];
};

const validateConfig = (config, rootDir = process.cwd()) => {
  if (!config || !Array.isArray(config.sections)) {
    throw new Error('WordPress build config must contain a sections array');
  }

  const names = new Set();
  return config.sections.map((section) => {
    if (!section || typeof section.name !== 'string' || !/^[a-z0-9-]+$/.test(section.name)) {
      throw new Error('Every WordPress component needs a lowercase kebab-case name');
    }
    if (names.has(section.name)) {
      throw new Error(`Duplicate WordPress component name: ${section.name}`);
    }
    names.add(section.name);

    const html = optionalSource(section.html, 'html', section.name, rootDir);
    if (!Array.isArray(html)) {
      throw new Error(`Section "${section.name}" html must be an array`);
    }

    return {
      name: section.name,
      html,
      style: optionalSource(section.style, 'style', section.name, rootDir),
      script: optionalSource(section.script, 'script', section.name, rootDir),
      assets: optionalSource(section.assets || [], 'assets', section.name, rootDir, true),
    };
  });
};

const listFiles = async (source) => {
  const stats = await fsp.stat(source);
  if (stats.isFile()) return [source];

  const entries = await fsp.readdir(source, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => listFiles(path.join(source, entry.name))));
  return nested.flat().sort();
};

const assetRelativePath = (source, rootDir, common = false) => {
  const base = common
    ? path.resolve(rootDir, 'src/resources')
    : path.resolve(rootDir, 'src/img');
  const relative = path.relative(base, source);
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) return relative;
  return path.basename(source);
};

const copyAssets = async (sources, destination, rootDir, common = false) => {
  const copied = [];
  for (const source of sources) {
    const files = await listFiles(source);
    for (const file of files) {
      const relative = assetRelativePath(file, rootDir, common);
      const target = path.join(destination, relative);
      await fsp.mkdir(path.dirname(target), { recursive: true });
      await fsp.copyFile(file, target);
      copied.push(toPosix(relative));
    }
  }
  return [...new Set(copied)].sort();
};

const rewriteSectionAssetUrls = (contents) => contents.replace(/(?:(?:\.\.\/)+|\.\/)?img\//g, 'img/');

const localAssetUrls = (contents) => {
  const urls = [];
  for (const match of contents.matchAll(/(?:src|data-flag)\s*=\s*["']([^"']+)["']/g)) {
    urls.push(match[1]);
  }
  for (const match of contents.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    urls.push(match[1]);
  }
  return urls
    .map((url) => url.split(/[?#]/)[0])
    .filter((url) => url.startsWith('img/'));
};

const assertDeclaredAssetsExist = (sectionName, sectionDir, generatedContents) => {
  for (const contents of generatedContents) {
    for (const url of localAssetUrls(contents)) {
      if (!fs.existsSync(path.resolve(sectionDir, url))) {
        throw new Error(`Section "${sectionName}" references undeclared local asset: ${url}`);
      }
    }
  }
};

const expandHtmlIncludes = async (source, ancestors = []) => {
  const absolute = path.resolve(source);
  if (ancestors.includes(absolute)) {
    throw new Error(`Recursive HTML include detected: ${path.basename(absolute)}`);
  }

  const contents = await fsp.readFile(absolute, 'utf8');
  const includePattern = /(^[ \t]*)?@include\(\s*["']([^"']+)["'](?:\s*,\s*\{[\s\S]*?\})?\s*\)/gm;
  let output = '';
  let cursor = 0;
  let match;

  while ((match = includePattern.exec(contents)) !== null) {
    output += contents.slice(cursor, match.index);
    const indentation = match[1] || '';
    const includedPath = path.resolve(path.dirname(absolute), match[2]);
    if (!fs.existsSync(includedPath)) {
      throw new Error(`HTML include does not exist in ${path.basename(absolute)}: ${match[2]}`);
    }
    const included = (await expandHtmlIncludes(includedPath, [...ancestors, absolute]))
      .replace(/\r?\n$/, '')
      .replace(/\r?\n/g, `\n${indentation}`);
    output += `${indentation}${included}`;
    cursor = includePattern.lastIndex;
  }

  return output + contents.slice(cursor);
};

const compileCss = async (source, rootDir, includeFoundation) => {
  const scssRoot = path.resolve(rootDir, 'src/scss');
  let result;
  if (includeFoundation && fs.existsSync(path.join(scssRoot, '_vars.scss'))) {
    const component = toPosix(source).replace(/"/g, '\\"');
    result = sass.compileString(
      `@import "vars";\n@import "mixins";\n@import "${component}";`,
      { loadPaths: [scssRoot], style: 'compressed', silenceDeprecations: ['import'] },
    );
  } else {
    result = sass.compile(source, { style: 'compressed', silenceDeprecations: ['import'] });
  }

  const processed = await postcss([
    autoprefixer({ overrideBrowserslist: ['last 5 versions'], grid: true }),
  ]).process(result.css, { from: source, map: false });
  return rewriteSectionAssetUrls(processed.css);
};

const validateCommon = (common, rootDir) => {
  if (!common) throw new Error('WordPress build config must contain common assets');
  return {
    style: optionalSource(common.style, 'style', 'common', rootDir),
    script: optionalSource(common.script, 'script', 'common', rootDir),
    assets: optionalSource(common.assets || [], 'assets', 'common', rootDir, true),
  };
};

const createWebpackEntries = (config, rootDir = process.cwd()) => {
  const common = validateCommon(config.common, rootDir);
  const sections = validateConfig(config, rootDir);
  const entries = {};
  if (common.script) entries.common = { import: [common.script] };

  sections.forEach((section) => {
    if (!section.script) return;
    const imports = Array.isArray(section.script) ? section.script : [section.script];
    entries[section.name] = {
      import: imports,
      ...(common.script ? { dependOn: 'common' } : {}),
    };
  });
  return entries;
};

const compileJavaScript = (config, rootDir, outputDir) => new Promise((resolve, reject) => {
  const entry = createWebpackEntries(config, rootDir);
  if (Object.keys(entry).length === 0) {
    resolve();
    return;
  }

  webpack({
    mode: 'production',
    context: rootDir,
    entry,
    output: {
      path: outputDir,
      filename: ({ chunk }) => chunk.name === 'common'
        ? 'common/common.js'
        : `sections/${chunk.name}/${chunk.name}.js`,
    },
    module: {
      rules: [{
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [[require.resolve('@babel/preset-env'), { targets: 'defaults' }]],
          },
        },
      }],
    },
    optimization: { splitChunks: false, runtimeChunk: false },
    devtool: false,
  }, (error, stats) => {
    if (error) {
      reject(error);
      return;
    }
    if (stats.hasErrors()) {
      reject(new Error(stats.toString({ colors: false, all: false, errors: true })));
      return;
    }
    resolve();
  });
});

const buildWordPressAssets = async ({
  config,
  rootDir = process.cwd(),
  outputDir = path.resolve(rootDir, 'wordpress'),
}) => {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedOutput = path.resolve(outputDir);
  const outputRelativeToRoot = path.relative(resolvedRoot, resolvedOutput);
  if (!outputRelativeToRoot || outputRelativeToRoot.startsWith('..') || path.isAbsolute(outputRelativeToRoot)) {
    throw new Error('WordPress output directory must be a child of the project root');
  }

  const sections = validateConfig(config, rootDir);
  const common = validateCommon(config.common, rootDir);
  await fsp.rm(resolvedOutput, { recursive: true, force: true });
  await fsp.mkdir(resolvedOutput, { recursive: true });
  outputDir = resolvedOutput;

  const manifest = {
    version: 1,
    common: { css: null, js: null, assets: [] },
    sections: {},
  };

  const commonDir = path.join(outputDir, 'common');
  await fsp.mkdir(commonDir, { recursive: true });
  if (common.style) {
    const css = (await compileCss(common.style, rootDir, false))
      .replace(/(?:(?:\.\.\/)+|\.\/)?fonts\//g, 'fonts/');
    await fsp.writeFile(path.join(commonDir, 'common.css'), css);
    manifest.common.css = 'common/common.css';
  }
  if (common.assets.length > 0) {
    const assets = await copyAssets(common.assets, commonDir, rootDir, true);
    manifest.common.assets = assets.map((file) => `common/${toPosix(file)}`);
  }

  for (const section of sections) {
    const sectionDir = path.join(outputDir, 'sections', section.name);
    await fsp.mkdir(sectionDir, { recursive: true });
    const htmlOutputs = [];
    const generatedContents = [];
    for (const source of section.html) {
      const filename = path.basename(source);
      const contents = rewriteSectionAssetUrls(await expandHtmlIncludes(source));
      await fsp.writeFile(path.join(sectionDir, filename), contents);
      generatedContents.push(contents);
      htmlOutputs.push(`sections/${section.name}/${filename}`);
    }

    let cssOutput = null;
    if (section.style) {
      const css = await compileCss(section.style, rootDir, true);
      const filename = `${section.name}.css`;
      await fsp.writeFile(path.join(sectionDir, filename), css);
      generatedContents.push(css);
      cssOutput = `sections/${section.name}/${filename}`;
    }

    const copiedAssets = section.assets.length > 0
      ? await copyAssets(section.assets, path.join(sectionDir, 'img'), rootDir)
      : [];
    assertDeclaredAssetsExist(section.name, sectionDir, generatedContents);
    manifest.sections[section.name] = {
      html: htmlOutputs,
      css: cssOutput,
      js: null,
      assets: copiedAssets.map((file) => `sections/${section.name}/img/${file}`),
      dependencies: ['common'],
    };
  }

  await compileJavaScript(config, rootDir, outputDir);
  if (common.script) manifest.common.js = 'common/common.js';
  sections.forEach((section) => {
    if (section.script) {
      manifest.sections[section.name].js = `sections/${section.name}/${section.name}.js`;
    }
  });

  await fsp.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
};

module.exports = {
  buildWordPressAssets,
  createWebpackEntries,
  validateConfig,
};
