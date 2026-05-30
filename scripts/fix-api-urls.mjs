import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(f) && !p.endsWith('services\\axios.js') && !p.endsWith('services/axios.js'))
      out.push(p);
  }
  return out;
}

function serviceImport(file) {
  const rel = path.relative(path.dirname(file), path.join(src, 'services', 'axios.js'));
  let r = rel.split(path.sep).join('/');
  if (!r.startsWith('.')) r = './' + r;
  return r.replace(/\.js$/, '');
}

function toApiPath(rest) {
  let p = rest || '';
  if (!p.startsWith('/')) p = '/' + p;
  if (p.startsWith('/api/')) p = p.slice(4);
  else if (p === '/api') p = '/';
  return p;
}

let count = 0;
for (const file of walk(src)) {
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;

  if (!c.includes('VITE_BACKEND') && !c.includes("VITE_API_URL || 'http://localhost:3000/api'")) continue;

  c = c.replace(
    /`https:\/\/\$\{import\.meta\.env\.VITE_BACKEND\}(\/api)?([^`]*?)`/g,
    (_, _apiPrefix, rest) => '`' + toApiPath(rest) + '`'
  );

  if (/const API_URL = `https:\/\/\$\{import\.meta\.env\.VITE_BACKEND\}\/api`/.test(orig)) {
    const imp = `import { getApiBaseUrl } from '${serviceImport(file)}';\n`;
    c = c.replace(
      /const API_URL = `https:\/\/\$\{import\.meta\.env\.VITE_BACKEND\}\/api`/,
      'const API_URL = getApiBaseUrl()'
    );
    if (!c.includes('getApiBaseUrl')) c = imp + c;
    else if (!c.match(/import\s*\{[^}]*getApiBaseUrl/)) c = imp + c;
  }

  c = c.replace(
    /const API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000\/api'/g,
    'const API_URL = getApiBaseUrl()'
  );

  if (c.includes('getApiBaseUrl()') && !c.match(/import\s*\{[^}]*getApiBaseUrl/)) {
    c = `import { getApiBaseUrl } from '${serviceImport(file)}';\n` + c;
  }

  const needsApi =
    c.includes('getApiBaseUrl') ||
    /\b(api|axios)\.(get|post|put|patch|delete)\(\s*[`'"]\//.test(c);

  if (needsApi) {
    c = c.replace(/import axios from ['"]axios['"];\s*\n?/g, '');
    c = c.replace(/import axios from ['"]\.\.\/services\/axios['"];\s*\n?/g, '');
    if (!c.includes("import api from")) {
      c = `import api from '${serviceImport(file)}';\n` + c;
    }
    c = c.replace(/\baxios\.(get|post|put|patch|delete)\(/g, 'api.$1(');
  }

  if (c !== orig) {
    fs.writeFileSync(file, c);
    count++;
    console.log('updated:', path.relative(src, file));
  }
}

console.log('total updated:', count);
