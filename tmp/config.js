export default {
  "pages": "/media/xubuncup/ntfsd/cup/www/00-digitak/digitrax/src/pages",
  "sourceDir": "src",
  "routifyDir": "node_modules/@sveltech/routify/tmp",
  "ignore": [],
  "unknownPropWarnings": true,
  "dynamicImports": true,
  "singleBuild": false,
  "scroll": "smooth",
  "extensions": [
    "html",
    "svelte",
    "md"
  ],
  "distDir": "dist",
  "noPrerender": false,
  "ssr": true,
  "prerender": true,
  "staticDir": "static",
  "scriptsDir": "scripts",
  "childProcess": "rollup -c -w",
  "unusedPropWarnings": true,
  "baseUrl": "/nodejs/digitrax/dist",
  "spaEntry": "/index.php"
}

export const baseUrl = "/nodejs/digitrax/dist"

export const spaEntry = "/index.php"
