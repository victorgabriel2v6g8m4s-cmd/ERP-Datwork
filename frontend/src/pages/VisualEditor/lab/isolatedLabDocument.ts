export interface IsolatedLabSource {
  html: string;
  css: string;
  javascript: string;
}

export const ISOLATED_LAB_DEFAULT_SOURCE: IsolatedLabSource = {
  html: '<main class="demo"><h1>Componente experimental</h1><button>Exemplo</button></main>',
  css: '.demo{padding:24px;border-radius:16px;background:#eef2ff}.demo h1{color:#3730a3}',
  javascript: "document.querySelector('button')?.addEventListener('click',()=>document.body.dataset.clicked='true');"
};

export const ISOLATED_LAB_LIMITS = { html: 20_000, css: 20_000, javascript: 20_000 } as const;

export function isWithinLabLimits(source: IsolatedLabSource): boolean {
  return source.html.length <= ISOLATED_LAB_LIMITS.html
    && source.css.length <= ISOLATED_LAB_LIMITS.css
    && source.javascript.length <= ISOLATED_LAB_LIMITS.javascript;
}

export const ISOLATED_LAB_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src data:',
  "connect-src 'none'",
  "font-src 'none'",
  "media-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "navigate-to 'none'",
  "base-uri 'none'"
].join('; ');

export function escapeEmbeddedClosingTag(value: string, tagName: 'script' | 'style'): string {
  return value.replace(new RegExp(`</${tagName}`, 'gi'), `<\\/${tagName}`);
}

export function createIsolatedLabDocument(source: IsolatedLabSource): string {
  const safeCss = escapeEmbeddedClosingTag(source.css, 'style');
  const safeJavascript = escapeEmbeddedClosingTag(source.javascript, 'script');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${ISOLATED_LAB_CSP}">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html{font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a}body{margin:0;padding:24px}${safeCss}</style>
<script>
'use strict';
const blockedPromise=()=>Promise.reject(new Error('Operação bloqueada pelo laboratório'));
Object.defineProperties(window,{
fetch:{value:blockedPromise,writable:false,configurable:false},
XMLHttpRequest:{value:undefined,writable:false,configurable:false},
WebSocket:{value:undefined,writable:false,configurable:false},
EventSource:{value:undefined,writable:false,configurable:false},
open:{value:()=>null,writable:false,configurable:false}
});
if(navigator.sendBeacon)Object.defineProperty(navigator,'sendBeacon',{value:()=>false,writable:false,configurable:false});
document.addEventListener('submit',event=>event.preventDefault(),true);
document.addEventListener('click',event=>{if(event.target instanceof Element&&event.target.closest('a'))event.preventDefault()},true);
</script>
</head>
<body>
${source.html}
<script>
'use strict';
${safeJavascript}
</script>
</body>
</html>`;
}
