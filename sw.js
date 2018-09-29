importScripts('/sw-toolbox.js');

const config = {
  offlinePage: '/youre-offline/'
};

config.filesToCache = [
  '/',
  config.offlinePage,
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/browserconfig.xml',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/manifest.json',
  '/mstile-70x70.png',
  '/mstile-144x144.png',
  '/mstile-150x150.png',
  '/mstile-310x150.png',
  '/mstile-310x310.png',
  '/safari-pinned-tab.svg'
];

/**
 * Generates a placeholder SVG image of the given size.
 */
function offlineImage(name, width, height) {
  return `<?xml version="1.0"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" fill-rule="evenodd"><path fill="#F8BBD0" d="M0 0h${width}v${height}H0z"/></g>
  <text text-anchor="middle" x="${Math.floor(width / 2)}" y="${Math.floor(height / 2)}">image offline (${name})</text>
<style><![CDATA[
text{
  font: 48px Roboto, Verdana, Helvetica, Arial, sans-serif;
}
]]></style>
</svg>`;
}
/**
 * Returns true if the Accept header contains the given content type string.
 */
function requestAccepts(request, contentType) {
  return request.headers.get('Accept').indexOf(contentType) != -1;
}


toolbox.options.debug = false;
toolbox.router.default = toolbox.networkFirst;
// network first amp runtime 
toolbox.router.get('/(.*)', toolbox.networkFirst, {origin: 'https://cdn.ampproject.org'});

toolbox.precache(config.filesToCache);

// Cache the page registering the service worker. Without this, the
// "first" page the user visits is only cached on the second visit,
// since the first load is uncontrolled.
toolbox.precache(
  clients.matchAll({includeUncontrolled: true}).then(l => {
    return l.map(c => c.url);
  })
);

// Claim clients so that the very first page load is controlled by a service
// worker. (Important for responding correctly in offline state.)
self.addEventListener('activate', () => self.clients.claim());

// Make sure the SW the page we register() is the service we use.
self.addEventListener('install', () => self.skipWaiting());