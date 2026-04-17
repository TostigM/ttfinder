// TTFinder — Main JS entry point

import { router } from './router.js';
import { renderNav, updateNav } from './components/nav.js';

const app = document.getElementById('app');

async function init() {
  renderNav();
  await router.navigate(window.location.pathname);
}

// Update nav and handle browser back/forward
window.addEventListener('popstate', async () => {
  await router.navigate(window.location.pathname);
  updateNav();
});

// Expose updateNav for pages that change auth state
window.TTFinder = window.TTFinder || {};
window.TTFinder.updateNav = updateNav;

init();
