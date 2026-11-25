import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    {
      name: 'font-preload-injector',
      enforce: 'post',
      generateBundle(_, bundle) {
        const criticalFontHints = ['manrope-latin-700', 'inter-latin-400', 'inter-latin-500'];
        const preloadFiles = Object.keys(bundle).filter((fileName) =>
          fileName.endsWith('.woff2') && criticalFontHints.some((hint) => fileName.includes(hint))
        );
        if (preloadFiles.length === 0) return;

        const preloadTags = preloadFiles
          .map((f) => `    <link rel="preload" as="font" type="font/woff2" href="/${f}" crossorigin>`)
          .join('\n');

        for (const asset of Object.values(bundle)) {
          if (asset.type === 'asset' && asset.fileName.endsWith('.html') && typeof asset.source === 'string') {
            asset.source = asset.source.replace('</head>', `${preloadTags}\n  </head>`);
          }
        }
      }
    },
    {
      name: 'multi-page-dev-router',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          let url = req.url ? req.url.split('?')[0] : '';
          if (url.length > 1 && url.endsWith('/')) {
            url = url.slice(0, -1);
          }
          const routes = ['/work', '/experience', '/achievements', '/about', '/contact'];
          if (routes.includes(url)) {
            req.url = `${url}/index.html`;
          } else if (url === '/privacy') {
            req.url = '/privacy.html';
          } else if (url === '/terms') {
            req.url = '/terms.html';
          } else if (url === '/404') {
            req.url = '/404.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          let url = req.url ? req.url.split('?')[0] : '';
          if (url.length > 1 && url.endsWith('/')) {
            url = url.slice(0, -1);
          }
          const routes = ['/work', '/experience', '/achievements', '/about', '/contact'];
          if (routes.includes(url)) {
            req.url = `${url}/index.html`;
          } else if (url === '/privacy') {
            req.url = '/privacy.html';
          } else if (url === '/terms') {
            req.url = '/terms.html';
          }
          next();
        });
      }
    },
    {
      name: 'netlify-functions-dev',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const host = req.headers.host || 'localhost:5173';
          const url = new URL(req.url, `http://${host}`);
          const pathname = url.pathname;

          let handlerFn = null;
          if (pathname === '/.netlify/functions/altcha' || pathname === '/api/altcha' || pathname === '/.netlify/functions/api/altcha') {
            const mod = await import('./netlify/functions/altcha.js');
            handlerFn = mod.handler;
          } else if (pathname === '/.netlify/functions/submit' || pathname === '/api/submit' || pathname === '/.netlify/functions/api/submit') {
            const mod = await import('./netlify/functions/submit.js');
            handlerFn = mod.handler;
          }

          if (!handlerFn) {
            return next();
          }

          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf8');

            const event = {
              httpMethod: req.method,
              headers: req.headers,
              queryStringParameters: Object.fromEntries(url.searchParams.entries()),
              body: rawBody
            };

            const result = await handlerFn(event);
            res.statusCode = result.statusCode || 200;
            for (const [key, val] of Object.entries(result.headers || {})) {
              res.setHeader(key, val);
            }
            res.end(result.body || '');
          } catch (err) {
            console.error('[VITE DEV FUNCTIONS ERROR]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: err.message }));
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        work: resolve(__dirname, 'work/index.html'),
        experience: resolve(__dirname, 'experience/index.html'),
        achievements: resolve(__dirname, 'achievements/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        workFlat: resolve(__dirname, 'work.html'),
        experienceFlat: resolve(__dirname, 'experience.html'),
        achievementsFlat: resolve(__dirname, 'achievements.html'),
        aboutFlat: resolve(__dirname, 'about.html'),
        contactFlat: resolve(__dirname, 'contact.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
