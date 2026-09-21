// Bundles the storefront into ONE self-contained html file for previewing.
const esbuild = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');

execSync('npx tailwindcss -c tailwind.config.js -i resources/css/app.css -o .build/app.css --minify', { stdio: 'inherit' });
const js = esbuild.buildSync({
  entryPoints: ['preview/main.jsx'], bundle: true, minify: true, write: false, format: 'iife',
  jsx: 'automatic', loader: { '.png': 'dataurl', '.jsx': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
}).outputFiles[0].text;
const css = fs.readFileSync('.build/app.css', 'utf8');
const tpl = fs.readFileSync('preview/index.template.html', 'utf8');
const out = tpl.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js.replace(/<\/script>/g, '<\\/script>'));
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', out);
console.log('dist/index.html', (out.length / 1024).toFixed(0) + ' KB');
