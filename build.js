import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';
import { execSync } from 'node:child_process';

const DIST = 'dist';

const htmlMinifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  useShortDoctype: true,
  keepClosingSlash: false,
};

async function build() {
  // Clean and recreate dist
  if (existsSync(DIST)) {
    await rm(DIST, { recursive: true });
  }
  await mkdir(DIST, { recursive: true });

  // Copy assets and static root files as-is
  console.log('Copying assets...');
  await cp('assets', `${DIST}/assets`, { recursive: true });
  await cp('robots.txt', `${DIST}/robots.txt`);
  await cp('sitemap.xml', `${DIST}/sitemap.xml`);

  // Copy pages directory
  await mkdir(`${DIST}/pages`, { recursive: true });

  // Minify HTML files
  console.log('Minifying HTML...');
  const pageFiles = await readdir('pages');
  const htmlFiles = [
    'index.html',
    ...pageFiles.filter(f => f.endsWith('.html')).map(f => `pages/${f}`),
  ];

  for (const file of htmlFiles) {
    const src = await readFile(file, 'utf-8');
    const minified = await minifyHtml(src, htmlMinifyOptions);
    await writeFile(`${DIST}/${file}`, minified);
    const reduction = ((1 - Buffer.byteLength(minified) / Buffer.byteLength(src)) * 100).toFixed(0);
    console.log(`  ${file}: ${(Buffer.byteLength(src) / 1024).toFixed(1)}KB → ${(Buffer.byteLength(minified) / 1024).toFixed(1)}KB (${reduction}%)`);
  }

  // Minify CSS
  console.log('Minifying CSS...');
  const cssSrc = await readFile('styles.css', 'utf-8');
  execSync(`npx csso styles.css --output ${DIST}/styles.css`, { stdio: 'pipe' });
  const cssOut = await readFile(`${DIST}/styles.css`, 'utf-8');
  const cssReduction = ((1 - Buffer.byteLength(cssOut) / Buffer.byteLength(cssSrc)) * 100).toFixed(0);
  console.log(`  styles.css: ${(Buffer.byteLength(cssSrc) / 1024).toFixed(1)}KB → ${(Buffer.byteLength(cssOut) / 1024).toFixed(1)}KB (${cssReduction}%)`);

  // Minify JS (preserving ES module syntax)
  console.log('Minifying JS...');
  const prodJsFiles = ['main.js', 'recipes.js', 'upload.js'];
  for (const file of prodJsFiles) {
    const src = await readFile(file, 'utf-8');
    const result = await minifyJs(src, {
      module: true,
      compress: { passes: 2 },
      mangle: { module: true },
      format: { comments: false },
    });
    if (result.error) {
      console.error(`  Error minifying ${file}:`, result.error);
      await cp(file, `${DIST}/${file}`);
    } else {
      await writeFile(`${DIST}/${file}`, result.code);
      const reduction = ((1 - Buffer.byteLength(result.code) / Buffer.byteLength(src)) * 100).toFixed(0);
      console.log(`  ${file}: ${(Buffer.byteLength(src) / 1024).toFixed(1)}KB → ${(Buffer.byteLength(result.code) / 1024).toFixed(1)}KB (${reduction}%)`);
    }
  }

  console.log('\nBuild complete → dist/');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
