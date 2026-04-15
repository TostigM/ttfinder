// TTFinder — Main JS entry point
// Handles client-side routing and page rendering.

import { router } from './router.js';
import { renderNav } from './components/nav.js';

const app = document.getElementById('app');

async function init() {
  renderNav();
  await router.navigate(window.location.pathname);
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
  router.navigate(window.location.pathname);
});

init();
